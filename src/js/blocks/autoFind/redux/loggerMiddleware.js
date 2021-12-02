import { last } from "lodash";
import { sendMessage } from "../utils/connector";
import { pushNotification } from "./predictionSlice";
import { selectLocatorById } from "./selectors";

const notify = (state, action, prevState, store) => {
  const pushNotificationHandler = (prevValue) => {
    const prevNotification = last(prevState.main.notifications) || {};

    const {isCanceled, isHandled} = prevNotification;
    if (isCanceled && !isHandled) return;

    store.dispatch(pushNotification({action, prevValue}));
  };

  const {type, payload} = action;
  switch (type) {
    case "main/changeLocatorAttributes":
      sendMessage.changeElementName(selectLocatorById(state, payload.element_id));
      pushNotificationHandler(selectLocatorById(prevState, payload.element_id));
      break;
    case "main/changeLocatorSettings":
      const prevValues = payload.map((el) => {
        return selectLocatorById(prevState, el.element_id);
      });
      pushNotificationHandler(prevValues);
      break;
    case "main/rerunGeneration/pending":
      pushNotificationHandler(payload);
      break;
    case "main/stopGeneration/fulfilled":
      pushNotificationHandler(payload);
      sendMessage.changeStatus(selectLocatorById(state, payload.element_id));
      break;
    case "main/stopGenerationGroup/fulfilled":
      pushNotificationHandler(payload);
      payload.forEach(({element_id}) => sendMessage.changeStatus(selectLocatorById(state, element_id)));
    case "main/toggleElementGeneration":
      sendMessage.toggle(selectLocatorById(state, payload));
      break;
    case "main/toggleElementGroupGeneration":
      payload.forEach((element) => {
        sendMessage.toggle(selectLocatorById(state, element.element_id));
      });
      break;
    case "main/toggleDeleted":
      sendMessage.toggleDeleted(selectLocatorById(state, payload));
      pushNotificationHandler(selectLocatorById(prevState, payload));
      break;
    case "main/toggleDeletedGroup":
      payload.forEach((element) => {
        sendMessage.toggleDeleted(selectLocatorById(state, element.element_id));
      });
      pushNotificationHandler(payload);
      break;
    case "main/updateLocator":
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
