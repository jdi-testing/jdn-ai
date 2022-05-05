import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { maxBy } from "lodash";

import { locatorTaskStatus } from "../../utils/constants";

export const locatorsAdapter = createEntityAdapter({
  selectId: (locator) => locator.element_id,
  sortComparer: (a, b) => a.order < b.order,
});

export const { selectAll: selectLocators, selectById: selectLocatorById } = locatorsAdapter.getSelectors(
    (state) => state.locators
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

export const selectLocatorsToGenerate = createSelector(
    selectLocatorsByProbability,
    (items) => items.filter((el) => el.generate && !el.deleted)
);

export const selectMaxOrderedLocator = createSelector(
    simpleSelectLocators,
    (items) => maxBy(items, "order"),
);
