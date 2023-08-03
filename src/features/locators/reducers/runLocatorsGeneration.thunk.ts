import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorTaskStatus, LocatorsGenerationStatus, LocatorsState } from "../types/locator.types";
import { runXpathGeneration } from "../utils/runXpathGeneration";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { RootState } from "../../../app/store/store";
import { runCssSelectorGeneration } from "../utils/runCssSelectorGeneration";
import { updateLocatorGroup } from "../locators.slice";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";

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

    const toGenerateXpaths = maxGenerationTime
      ? locators
      : generateMissingLocator || generateXpath
      ? locators.filter(
          ({ locator }) => !locator || !locator.xPath || locator.xPath === locator.fullXpath || !locator.fullXpath
        )
      : [];

    const toGenerateCss =
      generateMissingLocator || generateCssSelector
        ? locators.filter(({ locator }) => !locator || !locator.cssSelector)
        : [];

    const generations = Promise.all([
      ...[
        toGenerateXpaths.length
          ? runXpathGeneration(thunkAPI.getState() as RootState, toGenerateXpaths, maxGenerationTime)
          : null,
      ],
      ...[toGenerateCss.length ? runCssSelectorGeneration(toGenerateCss) : null],
    ]);

    const setPendingXpaths = toGenerateXpaths
      .filter((locator) => locator.locator && locator.locator.taskStatus !== LocatorTaskStatus.PENDING)
      .map(({ element_id }) => ({
        element_id,
        locator: { xPathStatus: LocatorTaskStatus.PENDING },
      }));

    const setPendingCss = toGenerateCss
      .filter((locator) => locator.locator && locator.locator.taskStatus !== LocatorTaskStatus.PENDING)
      .map(({ element_id }) => ({
        element_id,
        locator: { cssSelectorStatus: LocatorTaskStatus.PENDING },
      }));

    const state = thunkAPI.getState() as RootState;
    if (setPendingXpaths.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: setPendingXpaths,
          pageObject: selectCurrentPageObject(state)!,
        })
      );

    if (setPendingCss.length)
      thunkAPI.dispatch(
        updateLocatorGroup({
          locators: setPendingCss,
          pageObject: selectCurrentPageObject(state)!,
        })
      );

    return generations;
  }
);

export const runLocatorsGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(runLocatorsGeneration.pending, (state) => {
      state.generationStatus = LocatorsGenerationStatus.starting;
    })
    .addCase(runLocatorsGeneration.fulfilled, (state, { payload }) => {
      state.generationStatus = LocatorsGenerationStatus.started;
      const [_startXpaths, _startCss] = payload as [string | null, string | null];
    })
    .addCase(runLocatorsGeneration.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
