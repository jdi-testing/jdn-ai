import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNull } from "lodash";
import { getPageAttributes } from "../../services/pageObject";
import { getClassName } from "../../services/pageObjectTemplate";
import { pageObjAdapter, selectMaxId } from "../selectors/pageObjectSelectors";


export const addPageObj = createAsyncThunk("main/addPageObj", async (payload, thunkAPI) => {
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
        pageObjAdapter.addOne(state,
            {
              id: !isNull(maxExistingId) ? ++maxExistingId : 0,
              name: className,
              url,
            }
        );
      })
      .addCase(addPageObj.rejected, (state, { error }) => {
        throw new Error(error.stack);
      });
};
