import {createReducer, createAction} from "@reduxjs/toolkit";

const initialState = {
  status: "no status",
  predictedElements: [],
};

export const identifyElements = createAction({type: "FETCH_PREDICTION"});

const actionsMap = {
  [identifyElements]: (state) => {
    state.status = "Loading...";
  }
};

export default createReducer(initialState, actionsMap);
