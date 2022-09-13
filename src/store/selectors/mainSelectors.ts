import { last } from "lodash";
import { pageType } from "../../utils/constants";
import { Page } from "../slices/mainSlice.types";
import { RootState } from "../store";

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || {page: pageType.pageObject} as Page;
};
