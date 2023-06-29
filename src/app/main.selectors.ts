import { last } from "lodash";
import { pageType } from "../common/constants/constants";
import { BackendStatus, Page } from "./types/mainSlice.types";
import { RootState } from "./store/store";
import { createSelector } from "@reduxjs/toolkit";
import { selectPageObjects } from "../features/pageObjects/selectors/pageObjects.selectors";

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || ({ page: pageType.pageObject } as Page);
};

export const selectIsDefaultState = createSelector(
  selectCurrentPage,
  selectPageObjects,
  (state: RootState) => state.main.backendAvailable === BackendStatus.Accessed,
  (currentPage, pageObjects, isBackendAvailable) =>
    currentPage.page === pageType.pageObject && pageObjects.length === 0 && isBackendAvailable
);
