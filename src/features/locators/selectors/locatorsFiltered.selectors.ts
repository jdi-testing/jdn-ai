import { createSelector } from "@reduxjs/toolkit";
import { chain } from "lodash";
import { locatorTaskStatus } from "../../../common/constants/constants";
import { selectClassFilterByPO } from "../../filter/filter.selectors";
import { Locator } from "../types/locator.types";
import { filterLocatorsByClassFilter } from "../utils/filterLocators";
import { isProgressStatus } from "../utils/locatorGenerationController";
import { isValidLocator } from "../utils/utils";
import { selectLocatorsByPageObject, selectSortedLocators } from "./locatorsByPO.selectors";

export const selectFilteredLocators = createSelector(
  selectLocatorsByPageObject,
  selectClassFilterByPO,
  filterLocatorsByClassFilter
);

const selectSortedFilteredLocators = createSelector(
  selectSortedLocators,
  selectClassFilterByPO,
  filterLocatorsByClassFilter
);

export const selectGenerateByPageObject = createSelector(selectFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate)
);

export const selectActiveGenerateByPO = createSelector(selectGenerateByPageObject, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.active)
);

export const selectNonGenerateByPageObject = createSelector(selectFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => !elem?.generate)
);

export const selectActiveNonGenerateByPO = createSelector(
  selectNonGenerateByPageObject,
  (elements: Array<Locator> = []) => elements.filter((elem) => elem?.active)
);

export const selectConfirmedLocators = createSelector(selectSortedFilteredLocators, (elements: Array<Locator> = []) =>
  elements.filter((elem) => elem?.generate && !elem.deleted)
);

// move to loc
export const selectCalculatedByPageObj = createSelector(selectFilteredLocators, (locators: Locator[]) =>
  locators.filter(
    (_loc) => (_loc.locator.taskStatus === locatorTaskStatus.SUCCESS || _loc.isCustomLocator) && !_loc.deleted
  )
);

// move to loc
export const selectCalculatedActiveByPageObj = createSelector(selectCalculatedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

// move to loc
export const selectCalculatedGenerateByPageObj = createSelector(selectCalculatedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectDeletedByPageObj = createSelector(selectFilteredLocators, (items) =>
  chain(items)
    .filter((el) => el.deleted || false)
    .value()
);

// move to loc
export const selectDeletedGenerateByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectDeletedActiveByPageObj = createSelector(selectDeletedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

export const selectWaitingByPageObj = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter(
      (el) =>
        (isProgressStatus(el.locator.taskStatus) ||
          el.locator.taskStatus === locatorTaskStatus.REVOKED ||
          el.locator.taskStatus === locatorTaskStatus.FAILURE) &&
        !el.deleted
    )
    .value()
);

// move to loc
export const selectWaitingActiveByPageObj = createSelector(selectWaitingByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active)
);

// move to loc
export const selectInProgressByPageObj = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter((el) => isProgressStatus(el.locator.taskStatus) && !el.deleted)
    .value()
);

// move to loc
export const selectInProgressSelectedByPageObject = createSelector(selectInProgressByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectInProgressGenerateByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.generate)
);

// move to loc
export const selectFailedByPageObject = createSelector(selectFilteredLocators, (elements) =>
  elements.filter((element) => element.locator.taskStatus === locatorTaskStatus.FAILURE)
);

export const selectFailedSelectedByPageObject = createSelector(selectFailedByPageObject, (elements) =>
  elements.filter((element) => element.active)
);

export const selectActiveLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.active)
);

export const selectCheckedLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.generate)
);

export const selectValidLocators = createSelector(selectLocatorsByPageObject, (locators) =>
  locators.filter((loc) => isValidLocator(loc.message))
);
