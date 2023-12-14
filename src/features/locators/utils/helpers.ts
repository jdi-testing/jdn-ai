import { IdentificationStatus, ILocator, LocatorTaskStatus } from '../types/locator.types';
import { AUTO_GENERATION_THRESHOLD } from './constants';

export const isIdentificationLoading = (status: IdentificationStatus) => status === IdentificationStatus.loading;

export const isAutoStartGeneration = (items: any[]) => items.length <= AUTO_GENERATION_THRESHOLD;

export const isProgressStatus = (taskStatus?: LocatorTaskStatus) =>
  LocatorTaskStatus.PENDING === taskStatus || taskStatus === LocatorTaskStatus.STARTED;

export const filterInProgress = (locators: ILocator[]) =>
  locators.filter((locator) => isProgressStatus(locator.locatorValue.taskStatus) && !locator.deleted);
