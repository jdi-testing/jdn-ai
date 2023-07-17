import { ActionReducerMapBuilder, EntityState, createAsyncThunk } from "@reduxjs/toolkit";
import {
  IdentificationStatus,
  Locator,
  LocatorTaskStatus,
  LocatorsGenerationStatus,
  LocatorsState,
  PredictedEntity,
} from "../types/locator.types";
import { runXpathGeneration } from "./runXpathGeneration";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { RootState } from "../../../app/store/store";
import { selectAutoGeneratingLocatorTypes } from "../../pageObjects/selectors/pageObjects.selectors";
import { LocatorType } from "../../../common/types/common";
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
    const { locators, maxGenerationTime, generateXpath, generateCssSelector } = meta;
    const state = thunkAPI.getState() as RootState;

    return Promise.all([
      runXpathGeneration(thunkAPI.getState() as RootState, thunkAPI.dispatch, locators, maxGenerationTime),
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
