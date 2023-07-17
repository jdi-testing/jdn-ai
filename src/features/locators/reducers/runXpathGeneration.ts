import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "../../../app/store/store";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { selectCurrentPageObject, selectPageObjById } from "../../pageObjects/selectors/pageObjects.selectors";
import { updateLocatorGroup, failGeneration } from "../locators.slice";
import {
  IdentificationStatus,
  Locator,
  LocatorsGenerationStatus,
  LocatorsState,
  PredictedEntity,
} from "../types/locator.types";
import { locatorGenerationController } from "../utils/locatorGenerationController";
import { NO_ELEMENT_IN_DOCUMENT } from "../utils/constants";
import { sendMessage } from "../../../pageServices/connector";
import { selectLocatorById, selectLocatorByJdnHash } from "../selectors/locators.selectors";
import { getDocument } from "../../../common/utils/getDocument";

export const runXpathGeneration = async (
  state: RootState,
  dispatch: any,
  generationData: Locator[],
  maxGenerationTime?: MaxGenerationTime
) => {
  const pageObject = selectCurrentPageObject(state)!;

  const failHandler = async (ids: string[], errorMessage: string) => {
    if (ids.length === 1 && errorMessage === NO_ELEMENT_IN_DOCUMENT) {
      console.log("retry, but unexpected");
    } else dispatch(failGeneration({ ids, errorMessage }));
  };


  await locatorGenerationController.scheduleMultipleXpathGeneration(
    generationData,
    pageObject,
    maxGenerationTime,
  );

  return LocatorsGenerationStatus.started;
};
