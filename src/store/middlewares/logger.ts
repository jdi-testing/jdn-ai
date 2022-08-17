import { Middleware } from "@reduxjs/toolkit";

declare const __REDUX_LOG_ENABLE__: boolean;

export const logger: Middleware = (store) => (next) => (action) => {
  if (__REDUX_LOG_ENABLE__) {
    console.group(action.type);
    console.info("dispatching", action);
  }

  const result = next(action);

  if (__REDUX_LOG_ENABLE__) {
    console.log("next state", store.getState());
    console.groupEnd();
  }

  return result;
};
