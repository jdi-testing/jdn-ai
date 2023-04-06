import { last } from "lodash";
import { PageType } from "../app/types/mainSlice.types";
import { Page } from "./types/mainSlice.types";
import { RootState } from "./store/store";

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || ({ page: PageType.PageObject } as Page);
};
