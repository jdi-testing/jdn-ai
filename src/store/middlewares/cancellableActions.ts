import { Middleware } from "@reduxjs/toolkit";
import { compact, last } from "lodash";
import { selectLocatorById } from "../selectors/locatorSelectors";
import { Locator } from "../slices/locatorSlice.types";
import { pushNotification } from "../slices/mainSlice";
import { RootState } from "../store";

export const cancellableActions: Middleware = (store) => (next) => (action) => {
  const prevState: RootState = store.getState();
  const result = next(action);

  const pushNotificationHandler = (prevValue: any) => {
    const prevNotification = last(prevState.main.notifications);
    const isCanceled = prevNotification?.isCanceled;
    const isHandled = prevNotification?.isHandled;
    if (isCanceled && !isHandled) return;

    store.dispatch(pushNotification({ action, prevValue }));
  };

  const { type, payload, meta } = action;
  switch (type) {
    case "locators/changeLocatorAttributes": {
      const { element_id } = payload;
      const prevValue = selectLocatorById(prevState, element_id);
      if (!prevValue) return;
      pushNotificationHandler(prevValue);
      break;
    }
    case "locators/rerunGeneration/pending":
      pushNotificationHandler(meta.arg);
      break;
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
