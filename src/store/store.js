import {configureStore} from "@reduxjs/toolkit";
import locatorsSlice from "./slices/locatorsSlice";
import { logger } from "./loggerMiddleware";
import mainSlice from "./slices/mainSlice";
import pageObjectSlice from "./slices/pageObjectSlice";

const rootReducer = {
  main: mainSlice,
  locators: locatorsSlice,
  pageObject: pageObjectSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
