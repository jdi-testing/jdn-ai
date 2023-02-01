import { Tooltip } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../../app/mainSelectors";
import { PageType } from "../../../app/mainSlice.types";
import { selectCurrentPageObject } from "../../../features/pageObjects/pageObjectSelectors";

export const Breadcrumbs = () => {
  const currentPage = useSelector(selectCurrentPage);
  const pageObject = useSelector(selectCurrentPageObject);

  return currentPage.page === PageType.LocatorsList ? (
    <div className="jdn__breadcrumb">
      <Tooltip title={pageObject?.url} placement="bottomLeft" overlayStyle={{ maxWidth: "96%" }}>
        {`${pageObject?.name} > `}
      </Tooltip>
      <span>{currentPage.alreadyGenerated ? "Editing" : "Creating"}</span>
    </div>
  ) : null;
};
