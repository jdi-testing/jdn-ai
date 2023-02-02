import { Tooltip, Typography } from "antd";
import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../../app/main.selectors";
import { PageType } from "../../../app/types/mainSlice.types";
import { selectCurrentPageObject } from "../../../features/pageObjects/pageObject.selectors";

export const Breadcrumbs = (): ReactElement | null => {
  const currentPage = useSelector(selectCurrentPage);
  const pageObject = useSelector(selectCurrentPageObject);

  return currentPage.page === PageType.LocatorsList ? (
    <div className="jdn__breadcrumbs">
      <Tooltip title={pageObject?.url} placement="bottomLeft" overlayStyle={{ maxWidth: "96%" }}>
        <Typography.Text type="secondary">{`${pageObject?.name} > `}</Typography.Text>
      </Tooltip>
      <span>{currentPage.alreadyGenerated ? "Editing" : "Creating"}</span>
    </div>
  ) : null;
};