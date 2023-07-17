import { RootState } from "../../../app/store/store";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";
import { Locator, LocatorsGenerationStatus } from "../types/locator.types";
import { locatorGenerationController } from "../utils/locatorGenerationController";

export const runXpathGeneration = async (
  state: RootState,
  generationData: Locator[],
  maxGenerationTime?: MaxGenerationTime
) => {
  const pageObject = selectCurrentPageObject(state)!;
  await locatorGenerationController.scheduleMultipleXpathGeneration(generationData, pageObject, maxGenerationTime);

  return LocatorsGenerationStatus.started;
};
