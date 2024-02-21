import { createAsyncThunk } from '@reduxjs/toolkit';
import { isNull, map, size, toLower } from 'lodash';
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
import { getPageAttributes, isPONameUnique } from '../utils/pageObject';
import { getClassName } from '../utils/pageObjectTemplate';
import { getLocalStorage, LocalStorageKey } from '../../../common/utils/localStorage';
import { AnnotationType, FrameworkType, LocatorType } from '../../../common/types/common';

export const addPageObj = createAsyncThunk('pageObject/addPageObj', async (payload, { getState }) => {
  const res = await getPageAttributes();
  const { title, url } = res[0].result;
  const className = getClassName(title);

  const state = getState();

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

export const addPageObjReducer = (builder) => {
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

      // create unique PO name
      let maxExistingId = selectMaxId(state);
      const id = !isNull(maxExistingId) ? ++maxExistingId : 0;
      const pageObjects = simpleSelectPageObjects(state);
      const names = map(pageObjects, 'name');
      let name = className;

      for (let index = 0; !isPONameUnique(pageObjects, name); index++) {
        const repeats = size(names.filter((_name) => toLower(_name).includes(toLower(className))));
        name = `${className}${repeats + index}`;
      }

      const { pathname, origin, search } = new URL(url);

      pageObjAdapter.addOne(state, {
        id,
        name,
        url,
        framework: lastSelectedFrameworkType,
        library: lastSelectedLibrary,
        annotationType: lastSelectedAnnotationType,
        pathname,
        search,
        origin,
        ...(lastSelectedLocatorType ? { locatorType: lastSelectedLocatorType } : { locatorType: LocatorType.xPath }),
      });
      state.currentPageObject = id;
    })
    .addCase(addPageObj.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
