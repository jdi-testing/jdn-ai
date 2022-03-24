import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNull, map, size } from "lodash";
import { getPageAttributes } from "../../services/pageObject";
import { getClassName } from "../../services/pageObjectTemplate";
import { pageObjAdapter, selectMaxId, simpleSelectPageObjects } from "../selectors/pageObjectSelectors";


export const addPageObj = createAsyncThunk("pageObject/addPageObj", async (payload, thunkAPI) => {
  const res = await getPageAttributes();
  const {title, url} = res[0].result;
  const className = getClassName(title);
  return {className, url};
});

export const addPageObjReducer = (builder) => {
  return builder
      .addCase(addPageObj.fulfilled, (state, {payload}) => {
        const {className, url} = payload;
        let maxExistingId = selectMaxId(state);
        const id = !isNull(maxExistingId) ? ++maxExistingId : 0;
        const names = map(simpleSelectPageObjects(state), "name");
        let name = className;

        for (let index = 0; names.includes(name); index++) {
          const repeats = size(names.filter((_name) => _name.includes(className)));
          name = `${className}${repeats + index}`;
        }

        pageObjAdapter.addOne(state,
            {
              id,
              name,
              url,
            }
        );
        state.currentPageObject = id;
      })
      .addCase(addPageObj.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
