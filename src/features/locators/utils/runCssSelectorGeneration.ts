import { sendMessage } from '../../../pageServices/connector';
import { ILocator, LocatorsGenerationStatus } from '../types/locator.types';

export const runCssSelectorGeneration = async (locators: ILocator[]) => {
  sendMessage.generateSelectorGroupByHash({ elements: locators, fireCallbackMessage: true });
  return Promise.resolve(LocatorsGenerationStatus.started);
};
