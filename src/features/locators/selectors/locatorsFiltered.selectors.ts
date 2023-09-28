import { createSelector } from '@reduxjs/toolkit';
import { chain } from 'lodash';
import { LocatorCalculationPriority, LocatorTaskStatus, ILocator } from '../types/locator.types';
import { selectClassFilterByPO } from '../../filter/filter.selectors';

import { filterLocatorsByClassFilter } from '../utils/filterLocators';
import { selectLocatorsByPageObject, selectSortedLocators } from './locatorsByPO.selectors';
import { filterInProgress, isProgressStatus } from '../utils/helpers';

export const selectFilteredLocators = createSelector(
  selectLocatorsByPageObject,
  selectClassFilterByPO,
  filterLocatorsByClassFilter,
);

const selectSortedFilteredLocators = createSelector(
  selectSortedLocators,
  selectClassFilterByPO,
  filterLocatorsByClassFilter,
);

export const selectGenerateByPageObject = createSelector(selectFilteredLocators, (elements: ILocator[] = []) =>
  elements.filter((elem) => elem?.isGenerated),
);

export const selectActiveGenerateByPO = createSelector(selectGenerateByPageObject, (elements: ILocator[] = []) =>
  elements.filter((elem) => elem?.active),
);

export const selectNonGenerateByPageObject = createSelector(selectFilteredLocators, (elements: ILocator[] = []) =>
  elements.filter((elem) => !elem?.isGenerated),
);

export const selectActiveNonGenerateByPO = createSelector(selectNonGenerateByPageObject, (elements: ILocator[] = []) =>
  elements.filter((elem) => elem?.active && !elem.deleted),
);

export const selectConfirmedLocators = createSelector(selectSortedFilteredLocators, (elements: ILocator[] = []) =>
  elements.filter((elem) => elem?.isChecked && !elem.deleted),
);

export const selectCalculatedByPageObj = createSelector(selectFilteredLocators, (locators: ILocator[]) =>
  locators.filter(
    (_loc) => (_loc.locator.taskStatus === LocatorTaskStatus.SUCCESS || _loc.isCustomLocator) && !_loc.deleted,
  ),
);

export const selectStoppedActiveByPageObject = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter((el) => el.locator.taskStatus === LocatorTaskStatus.REVOKED && !!el.active && !el.deleted)
    .value(),
);

export const selectCalculatedActiveByPageObj = createSelector(selectCalculatedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active),
);

export const selectCalculatedGenerateByPageObj = createSelector(selectCalculatedByPageObj, (items) =>
  items.filter((item) => item.isGenerated),
);

export const selectCalculatedAndCheckedByPageObj = createSelector(selectCalculatedByPageObj, (items) =>
  items.filter((item) => item.isChecked === true),
);

export const selectDeletedByPageObj = createSelector(selectFilteredLocators, (items) =>
  chain(items)
    .filter((el) => el.deleted || false)
    .value(),
);

export const selectDeletedGenerateByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.isGenerated),
);

export const selectDeletedCheckedByPageObj = createSelector(selectDeletedByPageObj, (items) =>
  items.filter((item) => item.isChecked),
);

export const selectDeletedActiveByPageObj = createSelector(selectDeletedByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active),
);

export const selectWaitingByPageObj = createSelector(selectFilteredLocators, (elements) =>
  chain(elements)
    .filter(
      (el) =>
        (isProgressStatus(el.locator.taskStatus) ||
          el.locator.taskStatus === LocatorTaskStatus.REVOKED ||
          el.locator.taskStatus === LocatorTaskStatus.FAILURE) &&
        !el.deleted,
    )
    .value(),
);

export const selectInProgressHashes = createSelector(selectWaitingByPageObj, (locators) =>
  locators.map((loc) => loc.jdnHash),
);

export const selectWaitingActiveByPageObj = createSelector(selectWaitingByPageObj, (locators) =>
  locators.filter((_loc) => _loc.active),
);

export const selectActualActiveByPageObject = createSelector(
  selectCalculatedActiveByPageObj,
  selectWaitingActiveByPageObj,
  (locators) => locators,
);

export const selectInProgressByPageObj = createSelector(selectFilteredLocators, filterInProgress);

export const selectInProgressActiveByPageObject = createSelector(selectInProgressByPageObj, (items) =>
  items.filter((item) => item.active),
);

export const selectInProgressActiveNoPriorityByPageObject = createSelector(
  selectInProgressActiveByPageObject,
  (items) => items.filter((item) => !item.priority),
);

export const selectInProgressActiveIncPriorityByPageObject = createSelector(
  selectInProgressActiveByPageObject,
  (items) => items.filter((item) => item.priority === LocatorCalculationPriority.Increased),
);

export const selectInProgressActiveDecPriorityByPageObject = createSelector(
  selectInProgressActiveByPageObject,
  (items) => items.filter((item) => item.priority === LocatorCalculationPriority.Decreased),
);

export const selectInProgressGenerateByPageObj = createSelector(selectWaitingByPageObj, (items) =>
  items.filter((item) => item.isGenerated),
);

export const selectInProgressGenerateHashes = createSelector(selectInProgressGenerateByPageObj, (locators) =>
  locators.map((loc) => loc.jdnHash),
);

export const selectFailedByPageObject = createSelector(selectFilteredLocators, (elements) =>
  elements.filter((element) => element.locator.taskStatus === LocatorTaskStatus.FAILURE),
);

export const selectFailedSelectedByPageObject = createSelector(selectFailedByPageObject, (elements) =>
  elements.filter((element) => element.active),
);

export const selectActiveLocators = createSelector(selectFilteredLocators, (locators) =>
  locators.filter((_loc) => _loc.active),
);

export const selectCheckedLocatorsByPageObject = createSelector(selectFilteredLocators, (elements: ILocator[] = []) =>
  elements.filter((elem) => elem?.isChecked === true),
);
