import { sendMessage } from "../../../pageServices/connector";
import { setParents } from "../../../pageServices/pageDataHandlers";
import { createLocatorNames } from "../../pageObjects/utils/pageObject";
import { ElementLibrary } from "../types/generationClasses.types";
import { Locator, LocatorTaskStatus, PredictedEntity } from "../types/locator.types";
import { convertToListWithChildren } from "./locatorsTreeUtils";

export const createLocatorAttributes = async (
  elements: PredictedEntity[],
  library: ElementLibrary,
  isAutogenerating: Record<"generateCssSelector" | "generateXpath", boolean>
) => {
  const generationTags = await sendMessage.generateAttributes({
    elements,
    generateCss: isAutogenerating.generateCssSelector,
  });
  const generationData = createLocatorNames(generationTags, library);
  const _locatorsWithParents = await setParents(generationData);
  const locatorsWithParents: Locator[] = convertToListWithChildren(_locatorsWithParents);

  return locatorsWithParents;
};
