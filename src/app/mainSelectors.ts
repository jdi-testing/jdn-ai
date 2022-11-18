import { last } from "lodash";
import { pageType } from "../common/constants/constants";
import { Page } from "./mainSlice.types";
import { RootState } from "./store";

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || ({ page: pageType.pageObject } as Page);
};
