import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorsGenerationStatus, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { runLocatorGeneration } from '../utils/runLocatorGeneration';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { RootState } from '../../../app/store/store';
import { updateLocatorGroup } from '../locators.slice';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { filterLocatorsByClassFilter } from '../utils/filterLocators';
import { getLocalStorage, LocalStorageKey } from '../../../common/utils/localStorage';
import { selectClassFilterByPO } from '../../filter/filter.selectors';
import { selectPageDocumentForRobula } from '../../../services/pageDocument/pageDocument.selectors';
import { getTaskStatus } from '../utils/utils';

interface Meta {
  locators: ILocator[];
  maxGenerationTime?: MaxGenerationTime;
  generateXpath?: boolean;
  generateCssSelector?: boolean;
  generateMissingLocator?: boolean;
}

/* Purpose of this thunk is to start locators generation.
It's used for initial locators generation, or can be called on demand for particular locator type
or with parameters.
*/
export const runLocatorsGeneration = createAsyncThunk(
  'locators/runLocatorsGeneration',
  async (meta: Meta, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const currentPageObjLibrary = selectCurrentPageObject(state)?.library;
    const { locators, maxGenerationTime, generateXpath, generateCssSelector, generateMissingLocator } = meta;

    let filter = selectClassFilterByPO(state);
    if (currentPageObjLibrary && getLocalStorage(LocalStorageKey.Filter)) {
      filter = getLocalStorage(LocalStorageKey.Filter)[currentPageObjLibrary];
    }

    const getXPathsForGeneration = (): ILocator[] => {
      if (maxGenerationTime) {
        return locators;
      } else if (generateMissingLocator || generateXpath) {
        return filterLocatorsByClassFilter(locators, filter).filter(
          ({ locatorValue }) =>
            !locatorValue ||
            !locatorValue.xPath ||
            locatorValue.xPath === locatorValue.fullXpath ||
            !locatorValue.fullXpath,
        );
      } else {
        return [];
      }
    };

    const toGenerateXPaths: ILocator[] = getXPathsForGeneration();

    const toGenerateCss =
      generateMissingLocator || generateCssSelector
        ? filterLocatorsByClassFilter(locators, filter).filter(
            ({ locatorValue }) => !locatorValue || !locatorValue.cssSelector,
          )
        : [];

    const pageDocumentForRubula = selectPageDocumentForRobula(state);
    if (pageDocumentForRubula === null) {
      console.error(`can't run Xpath Generation: Page Document For Robula is null`);
      return;
    }

    const generations = Promise.all([
      ...[
        toGenerateXPaths.length || toGenerateCss.length
          ? runLocatorGeneration(
              state,
              [...toGenerateXPaths, ...toGenerateCss],
              pageDocumentForRubula,
              maxGenerationTime,
            )
          : null,
      ],
    ]);

    const XPathsSelectorsPending = toGenerateXPaths
      .filter((locator) => {
        const taskStatus = getTaskStatus(locator.locatorValue.xPathStatus, locator.locatorValue.cssSelectorStatus);
        return locator.locatorValue && taskStatus !== LocatorTaskStatus.PENDING;
      })
      .map(({ element_id, jdnHash }) => ({
        element_id,
        locatorValue: { xPathStatus: LocatorTaskStatus.PENDING },
        jdnHash,
      }));

    const cssSelectorsPending = toGenerateCss
      .filter((locator) => {
        const taskStatus = getTaskStatus(locator.locatorValue.xPathStatus, locator.locatorValue.cssSelectorStatus);
        return locator.locatorValue && taskStatus !== LocatorTaskStatus.PENDING;
      })
      .map(({ element_id, jdnHash }) => ({
        element_id,
        locatorValue: { cssSelectorStatus: LocatorTaskStatus.PENDING },
        jdnHash,
      }));

    if (XPathsSelectorsPending.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: XPathsSelectorsPending,
          pageObject: selectCurrentPageObject(state)!,
        }),
      );

    if (cssSelectorsPending.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: cssSelectorsPending,
          pageObject: selectCurrentPageObject(state)!,
        }),
      );

    return generations;
  },
);

export const runLocatorsGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(runLocatorsGeneration.pending, (state) => {
      state.generationStatus = LocatorsGenerationStatus.starting;
    })
    .addCase(runLocatorsGeneration.fulfilled, (state, { payload }) => {
      state.generationStatus = LocatorsGenerationStatus.started;
      const [_startXPaths, _startCss] = payload as [string | null, string | null];
    })
    .addCase(runLocatorsGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
