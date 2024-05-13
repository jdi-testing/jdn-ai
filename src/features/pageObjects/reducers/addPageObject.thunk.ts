import { type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { isNull, map } from 'lodash';
import {
  pageObjAdapter,
  selectLastAnnotationType,
  selectLastElementLibrary,
  selectLastFrameworkType,
  selectLastLocatorType,
  selectMaxId,
  simpleSelectPageObjects,
} from '../selectors/pageObjects.selectors';
import { defaultLibrary } from '../../locators/types/generationClasses.types';
import { getPageAttributes, getUniquePageObjectName } from '../utils/pageObject';
import { getClassName } from '../utils/pageObjectTemplate';
import { getLocalStorage, LocalStorageKey } from '../../../common/utils/localStorage';
import { AnnotationType, FrameworkType, LocatorType } from '../../../common/types/common';
import { RootState } from '../../../app/store/store';
import { PageObjectState } from '../types/pageObjectSlice.types';

export const addPageObj = createAsyncThunk('pageObject/addPageObj', async (payload, { getState }) => {
  const res = await getPageAttributes();
  const { title, url } = res[0].result;
  const className = getClassName(title);

  const state = getState() as RootState;

  const lastSelectedFrameworkType =
    getLocalStorage(LocalStorageKey.Framework) || selectLastFrameworkType(state) || FrameworkType.JdiLight;
  const lastSelectedLibrary =
    getLocalStorage(LocalStorageKey.Library) || selectLastElementLibrary(state) || defaultLibrary;
  const lastSelectedLocatorType = getLocalStorage(LocalStorageKey.LocatorType) || selectLastLocatorType(state);
  const lastSelectedAnnotationType =
    getLocalStorage(LocalStorageKey.AnnotationType) || selectLastAnnotationType(state) || AnnotationType.UI;

  return {
    className,
    url,
    lastSelectedFrameworkType,
    lastSelectedLibrary,
    lastSelectedLocatorType,
    lastSelectedAnnotationType,
  };
});

export const addPageObjReducer = (builder: ActionReducerMapBuilder<PageObjectState>) => {
  return builder
    .addCase(addPageObj.fulfilled, (state, { payload }) => {
      const {
        className,
        url,
        lastSelectedFrameworkType,
        lastSelectedLibrary,
        lastSelectedLocatorType,
        lastSelectedAnnotationType,
      } = payload;

      let maxExistingId = selectMaxId(state);
      const id = !isNull(maxExistingId) ? ++maxExistingId : 0;
      const pageObjects = simpleSelectPageObjects(state);
      const names = map(pageObjects, 'name');
      const name = getUniquePageObjectName(className, names, pageObjects);

      const { pathname, origin, search } = new URL(url);

      const pageObject = {
        id,
        framework: lastSelectedFrameworkType,
        library: lastSelectedLibrary,
        annotationType: lastSelectedAnnotationType,
        name,
        origin,
        pathname,
        pageData: null,
        url,
        search,
        ...(lastSelectedLocatorType ? { locatorType: lastSelectedLocatorType } : { locatorType: LocatorType.xPath }),
      };

      pageObjAdapter.addOne(state, pageObject);
      state.currentPageObject = id;
    })
    .addCase(addPageObj.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
