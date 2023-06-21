import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { Locator, LocatorTaskStatus, LocatorsState } from "../../../features/locators/types/locator.types";
import { runXpathGeneration } from "./runXpathGeneration.thunk";
import { sendMessage } from "../../../pageServices/connector";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const rerunGeneration = createAsyncThunk("locators/rerunGeneration", async (meta: Meta, thunkAPI) => {
  const {
    jdnHash,
    locator: { xPath, taskStatus },
  } = meta.generationData[0];
  if (meta.generationData.length === 1 && taskStatus === LocatorTaskStatus.FAILURE) {
    await sendMessage.assignJdnHash({ jdnHash, locator: xPath });
  }
  return thunkAPI.dispatch(runXpathGeneration(meta));
});

export const rerunGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(rerunGeneration.rejected, (_, { error }) => {
    throw new Error(error.stack);
  });
};
