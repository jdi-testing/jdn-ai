import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorsGenerationStatus, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { runXpathGeneration } from '../utils/runXpathGeneration';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { RootState } from '../../../app/store/store';
import { runCssSelectorGeneration } from '../utils/runCssSelectorGeneration';
import { updateLocatorGroup } from '../locators.slice';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { filterLocatorsByClassFilter } from '../utils/filterLocators';
import { getLocalStorage, LocalStorageKey } from '../../../common/utils/localStorage';
import { selectClassFilterByPO } from '../../filter/filter.selectors';
import { selectPageDocumentForRobula } from '../../../services/pageDocument/pageDocument.selectors';

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

    const getXpathsForGeneration = (): ILocator[] => {
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

    const toGenerateXpaths: ILocator[] = getXpathsForGeneration();

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
        toGenerateXpaths.length
          ? runXpathGeneration(state, toGenerateXpaths, pageDocumentForRubula, maxGenerationTime)
          : null,
      ],
      ...[toGenerateCss.length ? runCssSelectorGeneration(toGenerateCss) : null],
    ]);

    const setPendingXpaths = toGenerateXpaths
      .filter((locator) => locator.locatorValue && locator.locatorValue.taskStatus !== LocatorTaskStatus.PENDING)
      .map(({ element_id }) => ({
        element_id,
        locatorValue: { xPathStatus: LocatorTaskStatus.PENDING },
      }));

    const setPendingCss = toGenerateCss
      .filter((locator) => locator.locatorValue && locator.locatorValue.taskStatus !== LocatorTaskStatus.PENDING)
      .map(({ element_id }) => ({
        element_id,
        locatorValue: { cssSelectorStatus: LocatorTaskStatus.PENDING },
      }));

    if (setPendingXpaths.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: setPendingXpaths,
          pageObject: selectCurrentPageObject(state)!,
        }),
      );

    if (setPendingCss.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: setPendingCss,
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
      const [_startXpaths, _startCss] = payload as [string | null, string | null];
    })
    .addCase(runLocatorsGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
