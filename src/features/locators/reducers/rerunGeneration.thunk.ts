import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { Locator, LocatorTaskStatus, LocatorsGenerationStatus, LocatorsState } from "../../../features/locators/types/locator.types";
import { runXpathGeneration } from "./runXpathGeneration.thunk";
import { sendMessage } from "../../../pageServices/connector";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const rerunGeneration = createAsyncThunk("locators/rerunGeneration", async (meta: Meta, thunkAPI) => {
  if (meta.generationData.length === 1 && meta.generationData[0].locator.taskStatus === LocatorTaskStatus.FAILURE) {
    const { jdnHash, locator: {xPath} } = meta.generationData[0];
    await sendMessage.assignJdnHash({ jdnHash, locator: xPath });
  }
  return thunkAPI.dispatch(runXpathGeneration(meta));
});

export const rerunGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(rerunGeneration.rejected, (_, { error }) => {
    throw new Error(error.stack);
  });
};
