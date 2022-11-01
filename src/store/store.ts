import { configureStore } from "@reduxjs/toolkit";
import undoable from "redux-undo";
import { createListeners } from "../services/scriptListener";
import { cancellableActions } from "./middlewares/cancellableActions";
import { logger } from "./middlewares/logger";
import { scriptNotifier } from "./middlewares/scriptNotifier";
import locatorsSlice from "./slices/locatorsSlice";
import mainSlice from "./slices/mainSlice";
import pageObjectSlice from "./slices/pageObjectSlice";

const rootReducer = {
  main: mainSlice,
  locators: undoable(locatorsSlice, {undoType: "LOCATOR_UNDO", jumpType: "LOCATOR_JUMP"}),
  pageObject: undoable(pageObjectSlice, {undoType: "PAGEOBJECT_UNDO"}),
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: { ignoredActions: ["locators/setElementGroupGeneration", "locators/updateLocator"] }
  }).concat([logger, scriptNotifier, cancellableActions]),
});

store.subscribe(() => createListeners(store.dispatch, store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
