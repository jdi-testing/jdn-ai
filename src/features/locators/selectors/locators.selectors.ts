import { createDraftSafeSelector, createEntityAdapter, createSelector, EntityState } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store/store";
import { PageObject, PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementId, Locator } from "../types/locator.types";
import { getLocator } from "../utils/locatorOutput";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";
import { getTaskStatus } from "../utils/utils";

export const locatorsAdapter = createEntityAdapter<Locator>({
  selectId: (locator) => locator.element_id,
});

const { selectAll, selectById } = locatorsAdapter.getSelectors<RootState>((state) => state.locators.present);

export const selectLocatorById = createSelector(selectById, (_item?: Locator) => {
  if (_item) {
    return {
      ..._item,
      locator: {
        ..._item.locator,
        output: getLocator(_item.locator, _item.locatorType),
        taskStatus: getTaskStatus(_item.locator),
      },
    };
  }
  return _item;
});

export const selectLocators = createSelector(selectAll, (items: Locator[]) =>
  items.map((_item) => {
    return {
      ..._item,
      locator: {
        ..._item.locator,
        output: getLocator(_item.locator, _item.locatorType),
        taskStatus: getTaskStatus(_item.locator),
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
    Boolean(locator.children?.length) &&
    locator.children?.every((childId) => locators.some((loc) => loc.element_id === childId && loc.generate))
);

export const selectLocatorByJdnHash = createSelector(
  (state: RootState, jdnHash: string) => selectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
  (state: RootState) => selectCurrentPageObject(state)?.locators,
  (locators, pageObjLocators) => {
    return locators.find(({ element_id }) => pageObjLocators?.includes(element_id));
  }
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

export const simpleSelectLocatorByJdnHash = createDraftSafeSelector(
  (state: EntityState<Locator>, jdnHash: string) => simpleSelectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
  (_state: EntityState<Locator>, _: string, pageObject: PageObject) => pageObject.locators,
  (locators, pageObjLocators) => {
    return locators.find(({ element_id }) => pageObjLocators?.includes(element_id));
  }
);