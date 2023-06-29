import { configureStore } from "@reduxjs/toolkit";
import undoable from "redux-undo";
import filterSlice from "../../features/filter/filter.slice";
import locatorsSlice from "../../features/locators/locators.slice";
import pageObjectSlice from "../../features/pageObjects/pageObject.slice";
import { updateMessageHandler } from "../../pageServices/scriptMessageHandler";
import mainSlice from "../main.slice";
import { cancellableActions } from "../../common/components/notification/middlewares/cancellableActions";
import { logger } from "./middlewares/logger";
import { scriptNotifier } from "../../pageServices/scriptNotifier";
import { changePageMiddleware } from "./middlewares/changePage.middleware";

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
      serializableCheck: {
        ignoredActions: ["locators/setElementGroupGeneration", "locators/updateLocator", "locators/elementSetActive", "locators/toggleElementGroupGeneration"],
      },
    }).concat([logger, scriptNotifier, cancellableActions, changePageMiddleware]),
});

store.subscribe(() => updateMessageHandler(store.dispatch, store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
