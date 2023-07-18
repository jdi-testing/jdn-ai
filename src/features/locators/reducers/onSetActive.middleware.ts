import { Middleware } from "@reduxjs/toolkit";
import { Locator } from "../types/locator.types";
import { runLocatorsGeneration } from "./runLocatorsGeneration.thunk";

export const onSetActive: Middleware = (store) => (next) => (action) => {
  const { type, payload } = action;

  switch (type) {
    case "locators/elementGroupSetActive": {
      store.dispatch(
        // @ts-ignore
        runLocatorsGeneration({
          locators: payload.locators,
          generateMissingLocator: true,
        })
      );
      break;
    }
    case "locators/setActiveSingle":
    case "locators/elementSetActive": {
      store.dispatch(
        // @ts-ignore
        runLocatorsGeneration({
          locators: [payload as Locator],
          generateMissingLocator: true,
        })
      );
      break;
    }
  }

  return next(action);
};
