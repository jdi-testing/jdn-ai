import { createDraftSafeSelector, createEntityAdapter, createSelector, EntityState } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store/store";
import { PageObject, PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementId, ILocator } from "../types/locator.types";
import { getLocator } from "../utils/locatorOutput";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";
import { getTaskStatus } from "../utils/utils";

export const locatorsAdapter = createEntityAdapter<ILocator>({
  selectId: (locator) => locator.element_id,
});

const { selectAll, selectById } = locatorsAdapter.getSelectors<RootState>((state) => state.locators.present);

export const selectLocatorById = createSelector(selectById, (_item?: ILocator) => {
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

export const selectLocators = createSelector(selectAll, (items: ILocator[]) =>
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

export const selectLocatorsToGenerate = createSelector(selectLocators, (items: ILocator[]) =>
  items.filter((el) => el.isChecked && !el.deleted)
);

export const isLocatorIndeterminate = createSelector(
  selectLocators,
  selectLocatorById,
  (state: RootState) => state,
  (locators, locator, state) => {
    if (!locator) return false;
    if (locator.isGenerated) return false;
    const hasChildToGenerate = (_locator: ILocator) => {
      const hasSelectedChild =
        _locator.children &&
        _locator.children.some((childId) => locators.some((loc) => loc.element_id === childId && loc.isGenerated));
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
    locator.children?.every((childId) => locators.some((loc) => loc.element_id === childId && loc.isGenerated))
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
  (_: EntityState<ILocator>, pageObj: PageObjectId) => pageObj,
  (locators: ILocator[], pageObj: PageObjectId) => locators.filter((_loc) => _loc.pageObj === pageObj)
);

export const simpleSelectLocatorByJdnHash = createDraftSafeSelector(
  (state: EntityState<ILocator>, jdnHash: string) => simpleSelectLocators(state).filter((loc) => loc.jdnHash === jdnHash),
  (_state: EntityState<ILocator>, _: string, pageObject: PageObject) => pageObject.locators,
  (locators, pageObjLocators) => {
    return locators.find(({ element_id }) => pageObjLocators?.includes(element_id));
  }
);
