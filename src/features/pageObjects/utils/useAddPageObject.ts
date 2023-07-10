import { useDispatch, useSelector } from "react-redux";
import { addPageObj } from "../reducers/addPageObject.thunk";
import { selectPageObjects } from "../selectors/pageObjects.selectors";

export const useAddPageObject = (setActivePanel: (pageObjectId: string[] | undefined) => void) => {
  const pageObjects = useSelector(selectPageObjects);
  const newPOstub = pageObjects.find((pageObject) => !pageObject.locators?.length);
  const dispatch = useDispatch();

  return () => {
    if (newPOstub) {
      return setActivePanel([newPOstub.id.toString()]);
    }

    dispatch(addPageObj());
  };
};
