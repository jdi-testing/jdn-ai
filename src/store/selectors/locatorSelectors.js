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

export const selectLocatorsToGenerate = createSelector(selectLocatorsByProbability, (items) =>
  items.filter((el) => el.generate && !el.deleted)
);

export const selectMaxOrderedLocator = createSelector(simpleSelectLocators, (items) => maxBy(items, "order"));

export const isLocatorIndeterminate = createSelector(
    selectLocators,
    selectLocatorById,
    (state) => state,
    (locators, locator, state) => {
      if (locator.generate) return false;
      const hasChildToGenerate = (_locator) => {
        const hasSelectedChild = _locator.children.some((childId) =>
          locators.some((loc) => loc.element_id === childId && loc.generate)
        );
        return hasSelectedChild ||
        _locator.children.some((childId) => hasChildToGenerate(selectLocatorById(state, childId)));
      };

      return hasChildToGenerate(locator);
    }
);

export const areChildrenChecked = createSelector(selectLocators, selectLocatorById, (locators, locator) =>
  locator.children.every((childId) => locators.some((loc) => loc.element_id === childId && loc.generate))
);
