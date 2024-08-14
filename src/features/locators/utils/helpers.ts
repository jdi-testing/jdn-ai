import { IdentificationStatus, ILocator, LocatorTaskStatus } from '../types/locator.types';
import { AUTO_GENERATION_THRESHOLD } from './constants';
import { GeneralLocatorType, LocatorType } from '../../../common/types/common';
import { IGeneralWebSocketMessage } from './LocatorGenerationController';
import { getTaskStatus } from './utils';

export const isIdentificationLoading = (status: IdentificationStatus) => status === IdentificationStatus.loading;

export const isAutoStartGeneration = (items: any[]) => items.length <= AUTO_GENERATION_THRESHOLD;

export const isProgressStatus = (taskStatus: LocatorTaskStatus | null) => {
  return taskStatus === LocatorTaskStatus.PENDING || taskStatus === LocatorTaskStatus.STARTED;
};

export const filterInProgress = (locators: ILocator[]) =>
  locators.filter((locator) => {
    const status = getTaskStatus(locator.locatorValue.xPathStatus, locator.locatorValue.cssSelectorStatus);

    return isProgressStatus(status) && !locator.deleted;
  });

export const getWebSocketMessages = (
  priorityLocatorType: GeneralLocatorType,
  xPathGenerationMessage: IGeneralWebSocketMessage,
  CssSelectorGenerationMessage: IGeneralWebSocketMessage,
) => {
  const defaultWebSocketMessages = [xPathGenerationMessage, CssSelectorGenerationMessage];
  if (priorityLocatorType === LocatorType.xPath) return defaultWebSocketMessages;
  if (priorityLocatorType === LocatorType.cssSelector) return defaultWebSocketMessages.reverse();

  return defaultWebSocketMessages;
};

export const areAllValuesFalse = (filter: { [key: string]: boolean } | [string, boolean][]): boolean => {
  if (Array.isArray(filter)) {
    return filter.every(([_, value]) => value === false);
  } else {
    return Object.values(filter).every((value) => value === false);
  }
};
