import type { ActionReducerMapBuilder, Middleware } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { findByRules, predictElements } from '../../../pageServices/pageDataHandlers';
import { IdentificationStatus, LocatorsState, PredictedEntity } from '../types/locator.types';
import { setCurrentPageObj, setPageData } from '../../pageObjects/pageObject.slice';
import { setFilter } from '../../filter/filter.slice';
import { PageObjectId } from '../../pageObjects/types/pageObjectSlice.types';
import { defaultLibrary, ElementLibrary, predictEndpoints } from '../types/generationClasses.types';

import { createLocators } from './createLocators.thunk';
import { getLocalStorage, LocalStorageKey } from '../../../common/utils/localStorage';
import { selectAutoGeneratingLocatorTypes, selectPageObjById } from '../../pageObjects/selectors/pageObjects.selectors';
import { RootState } from '../../../app/store/store';
import { runLocatorsGeneration } from './runLocatorsGeneration.thunk';
import { finishProgressBar, setProgressError } from '../../pageObjects/progressBar.slice';
import { delay } from '../utils/delay';
import { fetchPageDocument } from '../../../services/pageDocument/fetchPageDocument.thunk';
import { createDocumentForRobula } from '../../../services/pageDocument/pageDocument.slice';

interface Meta {
  pageObj: PageObjectId;
}

export const identifyElements = createAsyncThunk('locators/identifyElements', async ({ pageObj }: Meta, thunkAPI) => {
  /* set current page object and filter */
  thunkAPI.dispatch(setCurrentPageObj(pageObj));

  /* set filter, if any exists in local storage */
  const state = thunkAPI.getState() as RootState;
  const library = selectPageObjById(state, pageObj)?.library || defaultLibrary;
  const savedFilters = getLocalStorage(LocalStorageKey.Filter);
  if (savedFilters && savedFilters[library]) {
    thunkAPI.dispatch(setFilter({ pageObjectId: pageObj, JDIclassFilter: savedFilters[library] }));
  }

  /* Identify elements, needed for testing purposes. Depend on selected element library,
  elements will be identified by predictElements() or findByRules().
  Then adds needed locators to state and runs locator value generation. */
  try {
    const endpoint = predictEndpoints[library];
    const { data, pageData, error } =
      library === ElementLibrary.Vuetify ? await findByRules() : await predictElements(endpoint);

    if (error) {
      thunkAPI.dispatch(setProgressError(error));
      return thunkAPI.rejectWithValue(null);
    }

    if (!data) {
      thunkAPI.dispatch(setProgressError('No data received from server'));
      return thunkAPI.rejectWithValue(null);
    }

    const locators = data
      .filter((el: PredictedEntity) => el.is_shown)
      .map((el: PredictedEntity) => {
        return {
          ...el,
          elementId: `${el.elementId}_${pageObj}`,
          jdnHash: el.elementId,
          pageObj: pageObj,
        };
      });

    await thunkAPI.dispatch(fetchPageDocument()).unwrap();
    thunkAPI.dispatch(createDocumentForRobula(data));

    thunkAPI.dispatch(finishProgressBar());
    /* progress-bar finish animation delay: */
    await delay(2000);

    if (pageData) {
      thunkAPI.dispatch(setPageData({ id: pageObj, pageData }));
    }

    thunkAPI.dispatch(createLocators({ predictedElements: locators, library }));

    return thunkAPI.fulfillWithValue(locators);
  } catch (error) {
    thunkAPI.dispatch(setProgressError(error.message || 'An unknown error occurred'));
    return thunkAPI.rejectWithValue(null);
  }
});

export const identifyElementsReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(identifyElements.pending, (state) => {
      state.status = IdentificationStatus.loading;
    })
    .addCase(identifyElements.fulfilled, (state, { payload }) => {
      if (payload.length) state.status = IdentificationStatus.preparing;
      else state.status = IdentificationStatus.noElements;
    })
    .addCase(identifyElements.rejected, (state) => {
      state.status = IdentificationStatus.error;
    });
};

export const onLocatorsCreated: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  if (action.type === createLocators.fulfilled.type) {
    const locators = action.payload;
    const { generateXpath, generateCssSelector } = selectAutoGeneratingLocatorTypes(state as RootState);
    // generateCssSelector: false because it's run with attributes generation for performance reasons
    // ToDo: take generateCssSelector from selectAutoGeneratingLocatorTypes, when backend will be ready
    // @ts-ignore
    store.dispatch(runLocatorsGeneration({ locators, generateXpath, generateCssSelector }));
  }

  return next(action);
};
