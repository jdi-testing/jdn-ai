import { configureStore } from "@reduxjs/toolkit";
import undoable from "redux-undo";
import filterSlice from "../features/filter/filterSlice";
import locatorsSlice from "../features/locators/locatorsSlice";
import pageObjectSlice from "../features/pageObjects/pageObjectSlice";
import { createListeners } from "../pageServices/scriptListener";
import mainSlice from "./mainSlice";
import { cancellableActions } from "./middlewares/cancellableActions";
import { logger } from "./middlewares/logger";
import { scriptNotifier } from "../pageServices/scriptNotifier";

const rootReducer = {
  main: mainSlice,
  filters: filterSlice,
  locators: undoable(locatorsSlice, { undoType: "LOCATOR_UNDO", jumpType: "LOCATOR_JUMP" }),
  pageObject: undoable(pageObjectSlice, { undoType: "PAGEOBJECT_UNDO" }),
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ["locators/setElementGroupGeneration", "locators/updateLocator", "locators/elementSetActive"] },
    }).concat([logger, scriptNotifier, cancellableActions]),
});

store.subscribe(() => createListeners(store.dispatch, store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
