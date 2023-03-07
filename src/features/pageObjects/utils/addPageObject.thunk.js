import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNull, map, size, toLower } from "lodash";
import {
  pageObjAdapter,
  selectLastElementLibrary,
  selectMaxId,
  simpleSelectPageObjects,
} from "../pageObject.selectors";
import { defaultLibrary } from "../../locators/types/generationClasses.types";
import { getPageAttributes, isPONameUnique } from "./pageObject";
import { getClassName } from "./pageObjectTemplate";

export const addPageObj = createAsyncThunk("pageObject/addPageObj", async (payload, thunkAPI) => {
  const res = await getPageAttributes();
  const { title, url } = res[0].result;
  const className = getClassName(title);
  const lastSelectedLibrary = selectLastElementLibrary(thunkAPI.getState());
  return { className, url, lastSelectedLibrary };
});

export const addPageObjReducer = (builder) => {
  return builder
    .addCase(addPageObj.fulfilled, (state, { payload }) => {
      const { className, url, lastSelectedLibrary } = payload;

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
        library: lastSelectedLibrary || defaultLibrary,
        pathname,
        search,
        origin,
      });
      state.currentPageObject = id;
    })
    .addCase(addPageObj.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
