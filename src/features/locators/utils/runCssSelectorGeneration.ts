import { sendMessage } from "../../../pageServices/connector";
import { Locator, LocatorsGenerationStatus } from "../types/locator.types";

export const runCssSelectorGeneration = async (locators: Locator[]) => {
  sendMessage.generateSelectorGroupByHash({ elements: locators, fireCallbackMessage: true });
  return Promise.resolve(LocatorsGenerationStatus.started);
};
