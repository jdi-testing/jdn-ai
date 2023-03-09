import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePage } from "../../app/main.slice";
import { RootState } from "../../app/store/store";
import { PageType } from "../../app/types/mainSlice.types";
import { IdentificationStatus } from "../locators/types/locator.types";
import { PageObjList } from "./components/PageObjList";

interface Props {
  template?: Blob;
}

export const PageObjectPage: React.FC<Props> = (props) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);
  const currentPageObject = useSelector((state: RootState) => state.pageObject.present.currentPageObject);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === IdentificationStatus.success) {
      dispatch(changePage({ page: PageType.LocatorsList, pageObj: currentPageObject }));
    }
  }, [status, generationStatus]);

  return (
    <div className="jdn__pageObject">
      <PageObjList {...props} />
    </div>
  );
};
