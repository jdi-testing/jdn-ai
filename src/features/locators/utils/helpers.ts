import { IdentificationStatus, Locator, LocatorTaskStatus } from "../types/locator.types";
import { AUTO_GENERATION_TRESHOLD } from "./constants";

export const isIdentificationLoading = (status: IdentificationStatus) => status === IdentificationStatus.loading;

export const isAutoStartGeneration = (items: any[]) => items.length <= AUTO_GENERATION_TRESHOLD;

export const isProgressStatus = (taskStatus?: LocatorTaskStatus) =>
  LocatorTaskStatus.PENDING === taskStatus || taskStatus === LocatorTaskStatus.STARTED;

export const filterInProgress = (elements: Locator[]) =>
  elements.filter((el) => isProgressStatus(el.locator.taskStatus) && !el.deleted);
