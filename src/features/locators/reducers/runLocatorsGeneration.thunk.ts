import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import {
  IdentificationStatus,
  Locator,
  LocatorTaskStatus,
  LocatorsGenerationStatus,
  LocatorsState,
} from "../types/locator.types";
import { runXpathGeneration } from "../utils/runXpathGeneration";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { RootState } from "../../../app/store/store";
import { runCssSelectorGeneration } from "../utils/runCssSelectorGeneration";
import { updateLocatorGroup } from "../locators.slice";

interface Meta {
  locators: Locator[];
  maxGenerationTime?: MaxGenerationTime;
  generateXpath?: boolean;
  generateCssSelector?: boolean;
  generateMissingLocator?: boolean;
}

export const runLocatorsGeneration = createAsyncThunk(
  "locators/runLocatorsGeneration",
  async (meta: Meta, thunkAPI) => {
    const { locators, maxGenerationTime, generateXpath, generateCssSelector, generateMissingLocator } = meta;

    const toGenerateXpats =
      generateMissingLocator || generateXpath
        ? locators.filter(({ locator }) => !locator || !locator.xPath || locator.xPath === locator.fullXpath)
        : [];
    const toGenerateCss =
      generateMissingLocator || generateCssSelector
        ? locators.filter(({ locator }) => !locator || !locator.cssSelector)
        : [];

    const generations = Promise.all([
      ...[
        toGenerateXpats.length
          ? runXpathGeneration(thunkAPI.getState() as RootState, toGenerateXpats, maxGenerationTime)
          : null,
      ],
      ...[toGenerateCss.length ? runCssSelectorGeneration(toGenerateCss) : null],
    ]);

    if (toGenerateXpats.length) {
      const setPending = locators
        .filter((locator) => locator.locator && locator.locator.taskStatus !== LocatorTaskStatus.PENDING)
        .map(({ element_id, locator: { taskStatus: _, ...rest } }) => ({
          element_id,
          locator: { ...rest, xPathStatus: LocatorTaskStatus.PENDING },
        }));

      thunkAPI.dispatch(updateLocatorGroup(setPending as Locator[]));
    }

    return generations;
  }
);

export const runLocatorsGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(runLocatorsGeneration.pending, (state) => {
      state.generationStatus = LocatorsGenerationStatus.starting;
    })
    .addCase(runLocatorsGeneration.fulfilled, (state) => {
      state.status = IdentificationStatus.noStatus;
      state.generationStatus = LocatorsGenerationStatus.started;
    })
    .addCase(runLocatorsGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
