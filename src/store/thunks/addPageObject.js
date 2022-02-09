import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNull } from "lodash";
import { getPageTitle } from "../../services/pageObject";
import { getClassName } from "../../services/pageObjectTemplate";
import { pageObjAdapter, selectMaxId } from "../selectors/pageObjectSelectors";


export const addPageObj = createAsyncThunk("main/addPageObj", async (payload, thunkAPI) => {
  const res = await getPageTitle();
  const title = getClassName(res[0].result);
  return title;
});

export const addPageObjReducer = (builder) => {
  return builder
      .addCase(addPageObj.fulfilled, (state, {payload}) => {
        let maxExistingId = selectMaxId(state);
        pageObjAdapter.addOne(state,
            {
              id: !isNull(maxExistingId) ? ++maxExistingId : 0,
              name: payload
            }
        );
      })
      .addCase(addPageObj.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
