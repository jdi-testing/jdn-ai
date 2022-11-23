import { Middleware } from "@reduxjs/toolkit";
import { compact } from "lodash";
import { selectLocatorById } from "../../features/locators/locatorSelectors";
import { Locator } from "../../features/locators/locatorSlice.types";
import { pushNotification } from "../mainSlice";
import { RootState } from "../store";

export const cancellableActions: Middleware = (store) => (next) => (action) => {
  const prevState: RootState = store.getState();
  const result = next(action);

  const pushNotificationHandler = (prevValue?: any) => {
    store.dispatch(pushNotification({ action, prevValue }));
  };

  const { type, payload, meta } = action;
  switch (type) {
    case "locators/changeLocatorAttributes":
    case "pageObject/removeAll":
    case "pageObject/removePageObject":
    case "pageObject/changeName": {
      pushNotificationHandler();
      break;
    }
    case "locators/rerunGeneration/pending":
    case "locators/stopGeneration/fulfilled":
      pushNotificationHandler(meta.arg);
      break;
    case "locators/stopGenerationGroup/fulfilled": {
      const _arr: Locator[] = compact(payload);
      pushNotificationHandler(_arr);
      break;
    }
    case "locators/toggleDeleted":
      pushNotificationHandler(selectLocatorById(prevState, payload));
      break;
    case "locators/toggleDeletedGroup":
      pushNotificationHandler(payload);
      break;
  }
  return result;
};
