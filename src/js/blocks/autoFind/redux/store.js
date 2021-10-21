import {configureStore} from "@reduxjs/toolkit";
import predictionSlice from "./predictionSlice";
// import reducer from "./reducer";

const rootReducer = {
  main: predictionSlice,
};

export const store = configureStore({
  reducer: rootReducer,
});
