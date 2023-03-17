import { Tooltip, Typography } from "antd";
import React, { ForwardedRef, ReactElement } from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../../app/main.selectors";
import { PageType } from "../../../app/types/mainSlice.types";
import { selectCurrentPageObject } from "../../../features/pageObjects/pageObject.selectors";

export const Breadcrumbs = React.forwardRef((props, ref: ForwardedRef<HTMLDivElement>): ReactElement | null => {
  const currentPage = useSelector(selectCurrentPage);
  const pageObject = useSelector(selectCurrentPageObject);

  return currentPage.page === PageType.LocatorsList ? (
    <div className="jdn__breadcrumbs" ref={ref}>
      <Tooltip title={pageObject?.url} placement="bottomLeft" getPopupContainer={(triggerNode) => triggerNode}>
        <Typography.Text type="secondary">{`${pageObject?.name} > `}</Typography.Text>
      </Tooltip>
      <span>{currentPage.alreadyGenerated ? "Editing" : "Creating"}</span>
    </div>
  ) : null;
});

Breadcrumbs.displayName = "Breadcrumbs";
