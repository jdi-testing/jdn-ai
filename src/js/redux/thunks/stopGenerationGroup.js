import { createAsyncThunk } from "@reduxjs/toolkit";
import { locatorTaskStatus, stopGenerationHandler } from "../../utils/locatorGenerationController";
import { locatorsAdapter } from "../selectors";


export const stopGenerationGroup = createAsyncThunk("main/stopGenerationGroup", async (elements, thunkAPI) => {
  const stopPromises = elements.map(({element_id}) => {
    return stopGenerationHandler(element_id);
  });
  return Promise.all(stopPromises).then((values) => {
    return thunkAPI.fulfillWithValue(values);
  });
});

export const stopGenerationGroupReducer = (builder) => {
  return builder.addCase(stopGenerationGroup.pending, (state, { meta }) => {
    state.showBackdrop = true;
    const newValue = meta.arg.map(({ element_id }) => {
      return {
        element_id,
        stopped: true,
      };
    });
    locatorsAdapter.upsertMany(state, newValue);
  })
      .addCase(stopGenerationGroup.fulfilled, (state, { meta }) => {
        state.showBackdrop = false;
        const newStatuses = meta.arg.map(({ element_id, locator }) => {
          return {
            element_id,
            locator: { ...locator, taskStatus: locatorTaskStatus.REVOKED },
          };
        });
        locatorsAdapter.upsertMany(state, newStatuses);
      })
      .addCase(stopGenerationGroup.rejected, (state, { error }) => {
        state.showBackdrop = false;
        throw new Error(error.stack);
      });
};
