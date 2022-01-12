import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

import { locatorTaskStatus } from "../utils/constants";

export const locatorsAdapter = createEntityAdapter({
  selectId: (locator) => locator.element_id,
});

export const { selectAll: selectLocators, selectById: selectLocatorById } = locatorsAdapter.getSelectors(
    (state) => state.main
);

export const { selectAll: simpleSelectLocators, selectById: simpleSelectLocatorById } = locatorsAdapter.getSelectors();

export const selectLocatorsByProbability = createSelector(
    selectLocators,
    (state) => state.main.perception,
    (items, perception) => items.filter((e) => e.predicted_probability >= perception)
);

export const selectGeneratedLocators = createSelector(selectLocatorsByProbability, (items) =>
  items.filter((el) => (el.locator.taskStatus === locatorTaskStatus.SUCCESS || el.isCustomLocator) && !el.deleted)
);

export const selectFirstPendingLocator = createSelector(selectLocatorsByProbability, (items) =>
  items.find((el) => el.locator.taskStatus === locatorTaskStatus.PENDING && !el.deleted)
);
