import { createDraftSafeSelector, createEntityAdapter, createSelector, EntityState } from "@reduxjs/toolkit";

import { RootState } from "../../app/store/store";
import { PageObjectId } from "../pageObjects/types/pageObjectSlice.types";
import { ElementId, Locator } from "./types/locator.types";
import { getCssSelector, getLocator, getXPathByPriority } from "./utils/locatorOutput";
import { LocatorType } from "../../common/types/common";

export const locatorsAdapter = createEntityAdapter<Locator>({
  selectId: (locator) => locator.element_id,
});

const { selectAll, selectById } = locatorsAdapter.getSelectors<RootState>((state) => state.locators.present);

export const selectLocatorById = createSelector(selectById, (_item?: Locator) => {
  if (_item) {
    const cssSelector = getCssSelector(_item.locator);
    return {
      ..._item,
      locator: {
        ..._item.locator,
        cssSelector,
        output: _item.locatorType === LocatorType.cssSelector ? cssSelector : getXPathByPriority(_item.locator),
      },
    };
  }
  return _item;
});

export const selectLocators = createSelector(selectAll, (items: Locator[]) =>
  items.map((_item) => {
    const cssSelector = getCssSelector(_item.locator);
    return {
      ..._item,
      locator: {
        ..._item.locator,
        cssSelector,
        output: _item.locatorType === LocatorType.cssSelector ? cssSelector : getXPathByPriority(_item.locator),
      },
    };
  })
);

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

/* these selectors are for using inside reducers */

export const { selectAll: simpleSelectLocators, selectById: simpleSelectLocatorById } = locatorsAdapter.getSelectors();

/* eslint-disable */
/* wrong toolkit typings */

// @ts-ignore
export const simpleSelectLocatorsByPageObject = createDraftSafeSelector(
  simpleSelectLocators,
  (_: EntityState<Locator>, pageObj: PageObjectId) => pageObj,
  (locators: Locator[], pageObj: PageObjectId) => locators.filter((_loc) => _loc.pageObj === pageObj)
);
