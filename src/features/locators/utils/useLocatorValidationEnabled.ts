import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../../app/main.selectors";
import { PageType } from "../../../app/types/mainSlice.types";

export const useLocatorValidationEnabled = () => {
  const currentPage = useSelector(selectCurrentPage);
  return !currentPage.alreadyGenerated && currentPage.page === PageType.LocatorsList;
};
