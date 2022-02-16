import { last } from "lodash";
import { pageType } from "../../utils/constants";


export const selectCurrentPage = (state) => {
  return last(state.main.pageHistory) || {page: pageType.pageObject};
};
