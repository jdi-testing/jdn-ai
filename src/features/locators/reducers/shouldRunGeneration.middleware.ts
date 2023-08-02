import { Middleware } from "@reduxjs/toolkit";
import { ElementId, Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";
import { getNoLocatorsElements, hasAllLocators } from "../utils/utils";
import { selectLocatorById } from "../selectors/locators.selectors";

export const shouldRunGeneration: Middleware = (store) => (next) => (action) => {
  const { type, payload } = action;
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
  }

  return next(action);
};
