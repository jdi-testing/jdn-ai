import { Middleware } from "@reduxjs/toolkit";
import { ElementId, Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";
import { getNoLocatorsElements, hasAllLocators } from "../utils/utils";
import { selectLocatorById } from "../selectors/locators.selectors";

const onSetActiveGroup = (dispatch: any, locators: Locator[]) => {
  dispatch(
    // @ts-ignore
    runLocatorsGeneration({
      locators: getNoLocatorsElements(locators),
      generateMissingLocator: true,
    })
  );
};

export const shouldRunGeneration: Middleware = (store) => (next) => (action) => {
  const { type, payload } = action;

  switch (type) {
    case "locators/setElementGroupGeneration": {
      const { locators, generate } = payload;
      if (generate) onSetActiveGroup(store.dispatch, locators);
      break;
    }
    case "locators/elementGroupSetActive": {
      onSetActiveGroup(store.dispatch, payload as Locator[]);
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
