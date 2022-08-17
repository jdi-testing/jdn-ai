import {configureStore} from "@reduxjs/toolkit";
import locatorsSlice from "./slices/locatorsSlice";
import { logger } from "./middlewares/logger";
import mainSlice from "./slices/mainSlice";
import pageObjectSlice from "./slices/pageObjectSlice";
import { scriptNotifier } from "./middlewares/scriptNotifier";
import { cancellableActions } from "./middlewares/cancellableActions";
import { createListeners } from "../services/scriptListener";
import initialScriptsAttach from "./enhancers/initialScriptsAttach";

const rootReducer = {
  main: mainSlice,
  locators: locatorsSlice,
  pageObject: pageObjectSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([logger, scriptNotifier, cancellableActions]),
  enhancers: [initialScriptsAttach],
});

store.subscribe(() => createListeners(store.dispatch, store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
