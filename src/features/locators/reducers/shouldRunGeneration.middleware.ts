import { Middleware } from "@reduxjs/toolkit";
import { ElementId, Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";
import { getNoLocatorsElements, hasAllLocators } from "../utils/utils";
import { selectLocatorById } from "../selectors/locators.selectors";
import { selectLocatorsByPageObject } from "../selectors/locatorsByPO.selectors";
import { AUTO_GENERATION_TRESHOLD } from "../utils/constants";

export const shouldRunGeneration: Middleware = (store) => (next) => (action) => {
  const { type, payload, meta } = action;
  const state = store.getState();

  switch (type) {
    case "locators/elementGroupSetActive": {
      const noLocators = getNoLocatorsElements(payload.locators);
      if (noLocators.length) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: noLocators,
            generateMissingLocator: true,
          })
        );
      }
      break;
    }
    case "locators/toggleElementGeneration":
    case "locators/setActiveSingle":
    case "locators/elementSetActive": {
      const _locator =
        typeof payload === "string" ? selectLocatorById(state, payload as ElementId) : (payload as Locator);
      if (!_locator) break;

      const noLocators = !hasAllLocators(_locator);
      if (noLocators) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: [_locator as Locator],
            generateMissingLocator: true,
          })
        );
      }
      break;
    }
    case "filter/toggleClassFilter/fulfilled": {
      const { value, jdiClass, pageObjectId } = meta.arg;
      if (!value) break;

      const locators = selectLocatorsByPageObject(state, pageObjectId).filter((loc) => loc.type === jdiClass);
      const noLocators = getNoLocatorsElements(locators);
      if (noLocators.length < AUTO_GENERATION_TRESHOLD) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: noLocators,
            generateMissingLocator: true,
          })
        );
      }

      break;
    }
    case "filter/toggleClassFilterAll/fulfilled": {
      const { value, pageObjectId } = meta.arg;
      if (!value) break;

      const noLocators = getNoLocatorsElements(selectLocatorsByPageObject(state, pageObjectId));
      if (noLocators.length < AUTO_GENERATION_TRESHOLD) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: noLocators,
            generateMissingLocator: true,
          })
        );
      }

      break;
    }
  }

  return next(action);
};
