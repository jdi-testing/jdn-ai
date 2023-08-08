import { Middleware } from "@reduxjs/toolkit";
import { Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";
import { getNoLocatorsElements, hasAllLocators } from "../utils/utils";
import { selectLocatorsByPageObject } from "../selectors/locatorsByPO.selectors";
import { AUTO_GENERATION_TRESHOLD } from "../utils/constants";

const onSetActiveGroup = (dispatch: any, locators: Locator[]) => {
  const noLocators = getNoLocatorsElements(locators);
  if (noLocators.length) {
    dispatch(
      // @ts-ignore
      runLocatorsGeneration({
        locators: noLocators,
        generateMissingLocator: true,
      })
    );
  }
};

export const shouldRunGeneration: Middleware = (store) => (next) => (action) => {
  const { type, payload, meta } = action;
  const state = store.getState();

  switch (type) {
    case "locators/setElementGroupGeneration": {
      const { locators, generate } = payload;
      if (generate) onSetActiveGroup(store.dispatch, locators);
      break;
    }
    case "locators/elementGroupSetActive": {
      onSetActiveGroup(store.dispatch, payload.locators as Locator[]);
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
