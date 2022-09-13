import { Breadcrumb, Tooltip } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { selectCurrentPageObject } from "../../store/selectors/pageObjectSelectors";
import { PageType } from "../../store/slices/mainSlice.types";

export const Breadcrumbs = () => {
  const currentPage = useSelector(selectCurrentPage);
  const pageObject = useSelector(selectCurrentPageObject);

  return (
    <div>
      {currentPage.page === PageType.LocatorsList ? (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Tooltip title={pageObject?.url} placement="bottomLeft" overlayStyle={{maxWidth: "96%"}}>
              {pageObject?.name}
            </Tooltip>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {currentPage.alreadyGenerated ? "Editing" : "Creating"}
          </Breadcrumb.Item>
        </Breadcrumb>
      ) : null}
    </div>
  );
};
