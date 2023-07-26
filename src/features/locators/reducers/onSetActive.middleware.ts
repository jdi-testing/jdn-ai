import { Middleware } from "@reduxjs/toolkit";
import { Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";
import { getNoLocatorsElements, hasAllLocators } from "../utils/utils";

export const onSetActive: Middleware = (store) => (next) => (action) => {
  const { type, payload } = action;

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
    case "locators/setActiveSingle":
    case "locators/elementSetActive": {
      const noLocators = !hasAllLocators(payload);
      if (noLocators) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: [payload as Locator],
            generateMissingLocator: true,
          })
        );
      }
      break;
    }
  }

  return next(action);
};
