import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNull, map, size, toLower } from "lodash";
import {
  pageObjAdapter,
  selectLastElementLibrary,
  selectLastLocatorType,
  selectMaxId,
  simpleSelectPageObjects,
} from "../selectors/pageObjects.selectors";
import { defaultLibrary } from "../../locators/types/generationClasses.types";
import { getPageAttributes, isPONameUnique } from "../utils/pageObject";
import { getClassName } from "../utils/pageObjectTemplate";
import { LocalStorageKey, getLocalStorage } from "../../../common/utils/localStorage";

export const addPageObj = createAsyncThunk("pageObject/addPageObj", async (payload, { getState }) => {
  const res = await getPageAttributes();
  const { title, url } = res[0].result;
  const className = getClassName(title);

  const state = getState();

  const lastSelectedLibrary =
    getLocalStorage(LocalStorageKey.Library) || selectLastElementLibrary(state) || defaultLibrary;
  const lastSelectedLocatorType = getLocalStorage(LocalStorageKey.LocatorType) || selectLastLocatorType(state);

  return { className, url, lastSelectedLibrary, lastSelectedLocatorType };
});

export const addPageObjReducer = (builder) => {
  return builder
    .addCase(addPageObj.fulfilled, (state, { payload }) => {
      const { className, url, lastSelectedLibrary, lastSelectedLocatorType } = payload;

      // create unique PO name
      let maxExistingId = selectMaxId(state);
      const id = !isNull(maxExistingId) ? ++maxExistingId : 0;
      const pageObjects = simpleSelectPageObjects(state);
      const names = map(pageObjects, "name");
      let name = className;

      for (let index = 0; !isPONameUnique(pageObjects, null, name); index++) {
        const repeats = size(
          names.filter((_name) => {
            const res = toLower(_name).includes(toLower(className));
            return res;
          })
        );
        name = `${className}${repeats + index}`;
      }

      const { pathname, origin, search } = new URL(url);

      pageObjAdapter.addOne(state, {
        id,
        name,
        url,
        library: lastSelectedLibrary,
        pathname,
        search,
        origin,
        ...(lastSelectedLocatorType ? { locatorType: lastSelectedLocatorType } : {}),
      });
      state.currentPageObject = id;
    })
    .addCase(addPageObj.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
