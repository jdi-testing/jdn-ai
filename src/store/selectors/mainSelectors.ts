import { last } from "lodash";
import { pageType } from "../../utils/constants";
import { RootState } from "../store";

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || {page: pageType.pageObject};
};
