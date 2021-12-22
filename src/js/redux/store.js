import {configureStore} from "@reduxjs/toolkit";
import { logger } from "./loggerMiddleware";
import predictionSlice from "./predictionSlice";

const rootReducer = {
  main: predictionSlice,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
