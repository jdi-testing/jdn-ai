import React from "react";
import { useDispatch, useSelector } from "react-redux";
// import { size } from "lodash";
import { Button } from "antd";
import Icon from "@ant-design/icons";

import { addPageObj } from "../../store/thunks/addPageObject";
import { generateAndDownloadZip } from "../../services/pageObject";

import PlusSvg from "../../assets/plus.svg";
import DownloadSvg from "../../assets/download.svg";
import { pushNotification } from "../../store/slices/mainSlice";
import { size } from "lodash";
import { selectPageObjects } from "../../store/selectors/pageObjectSelectors";

export const PageObjListHeader = () => {
  const state = useSelector((state) => state);
  const pageObjects = useSelector(selectPageObjects);

  const dispatch = useDispatch();
  const handleAddPageObject = () => dispatch(addPageObj());

  const handleDownload = () => {
    dispatch(pushNotification("Download"));
    generateAndDownloadZip(state);
  };

  return (
    <div className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title">Page Objects</span>
      <div className="jdn__locatorsList-header-buttons">
        {size(pageObjects) ? (
          <Button type="primary" onClick={handleDownload}>
            <Icon component={DownloadSvg} fill="#c15f0f" />
          </Button>
        ) : null}
        <Button className="jdn__buttons" onClick={handleAddPageObject}>
          <Icon component={PlusSvg} />
          New page object
        </Button>
      </div>
    </div>
  );
};
