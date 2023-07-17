import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import {
  IdentificationStatus,
  Locator,
  LocatorTaskStatus,
  LocatorsGenerationStatus,
  LocatorsState,
} from "../types/locator.types";
import { runXpathGeneration } from "./runXpathGeneration";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { RootState } from "../../../app/store/store";
import { locatorsAdapter } from "../selectors/locators.selectors";

interface Meta {
  locators: Locator[];
  maxGenerationTime?: MaxGenerationTime;
  generateXpath?: boolean;
  generateCssSelector?: boolean;
}

export const runLocatorsGeneration = createAsyncThunk(
  "locators/runLocatorsGeneration",
  async (meta: Meta, thunkAPI) => {
    const { locators, maxGenerationTime } = meta;

    return Promise.all([
      runXpathGeneration(thunkAPI.getState() as RootState, locators, maxGenerationTime),
      // (runCssSelectorGeneration)
    ]);
  }
);

export const runLocatorsGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(
      runLocatorsGeneration.pending,
      (
        state,
        {
          meta: {
            arg: { locators },
          },
        }
      ) => {
        const setPending = locators
          .filter((locator) => locator.locator && locator.locator.taskStatus !== LocatorTaskStatus.PENDING)
          .map(({ element_id, locator }) => ({
            element_id,
            locator: { ...locator, taskStatus: LocatorTaskStatus.PENDING },
          }));
        // @ts-ignore
        locatorsAdapter.upsertMany(state, setPending);
        state.generationStatus = LocatorsGenerationStatus.starting;
      }
    )
    .addCase(runLocatorsGeneration.fulfilled, (state) => {
      state.status = IdentificationStatus.noStatus;
      state.generationStatus = LocatorsGenerationStatus.started;
    })
    .addCase(runLocatorsGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
