import { last } from "lodash";

import { pushNotification } from "./mainSlice";
import { selectLocatorById } from "./selectors/locatorSelectors";
import { sendMessage } from "../services/connector";
import { pageType, VALIDATION_ERROR_TYPE } from "../utils/constants";

const notify = (state, action, prevState, store) => {
  const pushNotificationHandler = (prevValue) => {
    const prevNotification = last(prevState.main.notifications) || {};

    const {isCanceled, isHandled} = prevNotification;
    if (isCanceled && !isHandled) return;

    store.dispatch(pushNotification({action, prevValue}));
  };

  const {type, payload, meta} = action;
  switch (type) {
    case "locators/changeLocatorAttributes":
      const oldElement = selectLocatorById(prevState, payload.element_id);
      pushNotificationHandler(oldElement);
      if (!payload.validity) {
        sendMessage.changeElementName(selectLocatorById(state, payload.element_id));
      } else if (payload.validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT) {
        const newElement = selectLocatorById(state, payload.newElement.element_id);
        sendMessage.replaceElement({oldElement, newElement});
      } else {
        sendMessage.removeElement(oldElement);
      };
      break;
    case "locators/changeLocatorSettings":
      const prevValues = payload.map((el) => {
        return selectLocatorById(prevState, el.element_id);
      });
      pushNotificationHandler(prevValues);
      break;
    case "main/changePage":
      if (payload === pageType.pageObject) sendMessage.killHighlight();
      break;
    case "main/changePerception":
      sendMessage.setHighlight({perception: payload});
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
        const {element_id} = element;
        sendMessage.changeStatus(selectLocatorById(state, element_id));
      });
    case "locators/toggleElementGeneration":
      sendMessage.toggle({element: selectLocatorById(state, payload)});
      break;
    case "locators/toggleElementGroupGeneration":
      payload.forEach((element) => {
        sendMessage.toggle({element: selectLocatorById(state, element.element_id), skipScroll: true});
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
  // console.info('dispatching', action);
  const result = next(action);
  // console.log('next state', store.getState());
  // console.groupEnd();

  notify(store.getState(), action, prevState, store);
  return result;
};
