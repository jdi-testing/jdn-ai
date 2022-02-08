import {configureStore} from "@reduxjs/toolkit";
import { logger } from "./loggerMiddleware";
import pageObjectSlice from "./pageObjectSlice";
import predictionSlice from "./predictionSlice";

const rootReducer = {
  main: predictionSlice,
  pageObject: pageObjectSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
