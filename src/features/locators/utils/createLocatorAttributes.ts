import { sendMessage } from "../../../pageServices/connector";
import { setParents } from "../../../pageServices/pageDataHandlers";
import { createLocatorNames } from "../../pageObjects/utils/pageObject";
import { ElementLibrary } from "../types/generationClasses.types";
import { Locator, LocatorTaskStatus, PredictedEntity } from "../types/locator.types";
import { convertToListWithChildren } from "./locatorsTreeUtils";

export const createLocatorAttributes = async (elements: PredictedEntity[], library: ElementLibrary, isAutogeneratingAll: boolean) => {
    const generationTags = await sendMessage.generateAttributes({ elements, generateCss: true });
    const generationData = createLocatorNames(generationTags, library);
    const _locatorsWithParents = await setParents(generationData);
    const locatorsWithParents: Locator[] = convertToListWithChildren(_locatorsWithParents);
    const locators = locatorsWithParents.map((locator) => ({
      ...locator,
      locator: {
        ...locator.locator,
        // now it's here for a performance optimization,
        // but with migration to React 18 it should be moved to the generateLocators thunk,
        // where this business logic actually happens
        ...(isAutogeneratingAll ? { taskStatus: LocatorTaskStatus.PENDING } : {}),
      },
    }));

    return locators;
}
