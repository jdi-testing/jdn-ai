import { Middleware } from "@reduxjs/toolkit";
import { changePage } from "../../main.slice";
import { PageType } from "../../types/mainSlice.types";

export const changePageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "locators/identifyElements/fulfilled") {
    store.dispatch(changePage({ page: PageType.LocatorsList }));
  }

  return result;
};
