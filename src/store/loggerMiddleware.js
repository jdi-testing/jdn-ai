import { last, size } from "lodash";

import { pushNotification } from "./slices/mainSlice";
import { selectLocatorById } from "./selectors/locatorSelectors";
import { sendMessage } from "../services/connector";
import { pageType } from "../utils/constants";
import { selectCurrentPage } from "./selectors/mainSelectors";
import { isErrorValidationType } from "../utils/helpers";
import { selectLocatorsByPageObject } from "./selectors/pageObjectSelectors";

const notify = (state, action, prevState, store) => {
  const pushNotificationHandler = (prevValue) => {
    const prevNotification = last(prevState.main.notifications) || {};

    const { isCanceled, isHandled } = prevNotification;
    if (isCanceled && !isHandled) return;

    store.dispatch(pushNotification({ action, prevValue }));
  };

  const { type, payload, meta } = action;
  switch (type) {
    case "pageObject/addLocatorsToPageObj":
      const locators = selectLocatorsByPageObject(state, state.pageObject.currentPageObject);
      sendMessage.setHighlight({ elements: locators, perception: state.main.perception });
      break;
    case "locators/changeLocatorAttributes":
      const {element_id, validity, type, name} = payload;
      const prevValue = selectLocatorById(prevState, element_id);
      pushNotificationHandler(prevValue);
      if (prevValue.type !== type || prevValue.name !== name) {
        sendMessage.changeElementName(selectLocatorById(state, element_id));
      } else if (isErrorValidationType(prevValue?.validity?.locator)) {
        // restore previously invalid locator
        const newValue = selectLocatorById(state, element_id);
        sendMessage.addElement(newValue);
      } else if (isErrorValidationType(validity?.locator)) {
        // delete invalid locator
        sendMessage.removeElement(prevValue);
      }
      break;
    case "main/changePage":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
    case "main/changePageBack":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
    case "main/changePerception":
      sendMessage.setHighlight({ perception: payload });
      break;
    case "locators/rerunGeneration/pending":
      pushNotificationHandler(meta.arg);
      break;
    case "locators/stopGeneration/fulfilled":
      pushNotificationHandler(meta.arg);
      sendMessage.changeStatus(selectLocatorById(state, meta.arg));
      break;
    case "locators/stopGenerationGroup/fulfilled":
      const _arr = _.compact(payload);
      pushNotificationHandler(_arr);
      _arr.forEach((element) => {
        const { element_id } = element;
        sendMessage.changeStatus(selectLocatorById(state, element_id));
      });
    case "locators/toggleElementGeneration":
      sendMessage.toggle({ element: selectLocatorById(state, payload) });
      break;
    case "locators/toggleElementGroupGeneration":
      payload.forEach((element) => {
        sendMessage.toggle({ element: selectLocatorById(state, element.element_id), skipScroll: true });
      });
      break;
    case "locators/setChildrenGeneration":
      const { locator } = payload;
      const iterateChildren = (_locator) => {
        _locator.children.forEach((childId) => {
          const child = selectLocatorById(state, childId);
          sendMessage.toggle({ element: child, skipScroll: true });
          if (size(child.children)) iterateChildren(child);
        });
      };
      iterateChildren(locator);
      break;
    case "locators/setElementGroupGeneration":
      payload.ids.forEach((id) => {
        sendMessage.toggle({ element: selectLocatorById(state, id), skipScroll: true });
      });
      break;
    case "locators/toggleDeleted":
      sendMessage.toggleDeleted(selectLocatorById(state, payload));
      pushNotificationHandler(selectLocatorById(prevState, payload));
      break;
    case "locators/toggleDeletedGroup":
      payload.forEach((element) => {
        sendMessage.toggleDeleted(selectLocatorById(state, element.element_id));
      });
      pushNotificationHandler(payload);
      break;
    case "locators/updateLocator":
      sendMessage.changeStatus(payload);
      break;
  }
};

export const logger = (store) => (next) => (action) => {
  const prevState = store.getState();
  // console.group(action.type);
  // console.info("dispatching", action);
  const result = next(action);
  // console.log("next state", store.getState());
  // console.groupEnd();

  notify(store.getState(), action, prevState, store);
  return result;
};
