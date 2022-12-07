import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { ElementId, Locator } from "./locatorSlice.types";

export const locatorsAdapter = createEntityAdapter<Locator>({
  selectId: (locator) => locator.element_id,
});

export const { selectAll: selectLocators, selectById: selectLocatorById } = locatorsAdapter.getSelectors<RootState>(
    (state) => state.locators.present
);

export const { selectAll: simpleSelectLocators, selectById: simpleSelectLocatorById } = locatorsAdapter.getSelectors();

export const selectLocatorsToGenerate = createSelector(selectLocators, (items: Locator[]) =>
  items.filter((el) => el.generate && !el.deleted)
);

export const isLocatorIndeterminate = createSelector(
    selectLocators,
    selectLocatorById,
    (state: RootState) => state,
    (locators, locator, state) => {
      if (!locator) return false;
      if (locator.generate) return false;
      const hasChildToGenerate = (_locator: Locator) => {
        const hasSelectedChild =
        _locator.children &&
        _locator.children.some((childId) => locators.some((loc) => loc.element_id === childId && loc.generate));
        return (
          hasSelectedChild ||
        (_locator.children &&
          _locator.children.some((childId: ElementId) => {
            const _locator = selectLocatorById(state, childId);
            if (_locator) hasChildToGenerate(_locator);
          }))
        );
      };

      return hasChildToGenerate(locator);
    }
);

export const areChildrenChecked = createSelector(
    selectLocators,
    selectLocatorById,
    (locators, locator) =>
      locator &&
    locator.children &&
    locator.children.every((childId) => locators.some((loc) => loc.element_id === childId && loc.generate))
);
