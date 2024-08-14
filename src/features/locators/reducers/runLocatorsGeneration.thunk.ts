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

export const runLocatorsGeneration = createAsyncThunk(
  'locators/runLocatorsGeneration',
  async (meta: Meta, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;

      const currentPageObjLibrary = selectCurrentPageObject(state)?.library;
      const { locators, maxGenerationTime, generateXpath, generateCssSelector, generateMissingLocator } = meta;

      let filter = selectClassFilterByPO(state);

      if (currentPageObjLibrary && getLocalStorage(LocalStorageKey.Filter)) {
        const storedFilters = getLocalStorage(LocalStorageKey.Filter);
        filter = storedFilters ? storedFilters[currentPageObjLibrary] || {} : {};
      }

      const getXPathsForGeneration = (): ILocator[] => {
        if (maxGenerationTime) {
          return locators;
        } else if (generateMissingLocator || generateXpath) {
          if (!filter || Object.keys(filter).length === 0) {
            console.error('filter is empty or invalid:', filter);
            return locators;
          }
          const res = filterLocatorsByClassFilter(locators, filter).filter(
            ({ locatorValue }) =>
              !locatorValue ||
              !locatorValue.xPath ||
              locatorValue.xPath === locatorValue.fullXpath ||
              !locatorValue.fullXpath,
          );

          return res;
        } else {
          return locators;
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

      const generations = await Promise.all([
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
        .map(({ elementId, jdnHash }) => ({
          elementId,
          locatorValue: { xPathStatus: LocatorTaskStatus.PENDING },
          jdnHash,
        }));

      const cssSelectorsPending = toGenerateCss
        .filter((locator) => {
          const taskStatus = getTaskStatus(locator.locatorValue.xPathStatus, locator.locatorValue.cssSelectorStatus);
          return locator.locatorValue && taskStatus !== LocatorTaskStatus.PENDING;
        })
        .map(({ elementId, jdnHash }) => ({
          elementId,
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
    } catch (error) {
      console.error('Error in runLocatorsGeneration:', error);
      throw error;
    }
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
      console.error('runLocatorsGeneration was rejected:', error);
      throw new Error(error.stack);
    });
};
