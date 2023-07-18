import { sendMessage } from "../../../pageServices/connector";
import { Locator } from "../types/locator.types";

export const runCssSelectorGeneration = async (locators: Locator[]) => {
  sendMessage.generateSelectorGroupByHash({ elements: locators, fireCallbackMessage: true });
  return Promise.resolve("started");
};
