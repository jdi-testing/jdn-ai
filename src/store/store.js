import {configureStore} from "@reduxjs/toolkit";
import locatorsSlice from "./locatorsSlice";
import { logger } from "./loggerMiddleware";
import mainSlice from "./mainSlice";
import pageObjectSlice from "./pageObjectSlice";

const rootReducer = {
  main: mainSlice,
  locators: locatorsSlice,
  pageObject: pageObjectSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
