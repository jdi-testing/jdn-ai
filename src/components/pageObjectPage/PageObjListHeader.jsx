import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";

import { addPageObj } from "../../store/thunks/addPageObject";
import { generateAndDownloadZip } from "../../services/pageObject";

import PlusSvg from "../../assets/plus.svg";
import DownloadSvg from "../../assets/download.svg";
import { pushNotification } from "../../store/slices/mainSlice";
import { size } from "lodash";
import { selectPageObjects } from "../../store/selectors/pageObjectSelectors";

import TrashBinSVG from "../../assets/trash-bin.svg";
import { removeAll as removeAllPageObjects } from "../../store/slices/pageObjectSlice";
import { removeAll as removeAllLocators } from "../../store/slices/locatorsSlice";

export const PageObjListHeader = () => {
  const state = useSelector((state) => state);
  const pageObjects = useSelector(selectPageObjects);

  const dispatch = useDispatch();
  const handleAddPageObject = () => dispatch(addPageObj());

  const handleDownload = () => {
    dispatch(pushNotification("Download"));
    generateAndDownloadZip(state);
  };

  const handleRemoveAll = () => {
    dispatch(removeAllPageObjects());
    dispatch(removeAllLocators());
  };

  return (
    <div className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title">Page Objects</span>
      <div className="jdn__locatorsList-header-buttons">
        <Button className="jdn__buttons" onClick={handleAddPageObject}>
          <Icon component={PlusSvg} />
          New page object
        </Button>
        {size(pageObjects) ? (
          <React.Fragment>
            <Tooltip placement="bottom" title="Delete all">
              <Button hidden={!size(pageObjects)} danger onClick={handleRemoveAll}>
                <Icon fill="#D82C15" component={TrashBinSVG} />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Download all">
              <Button type="primary" onClick={handleDownload}>
                <Icon component={DownloadSvg} fill="#c15f0f" />
              </Button>
            </Tooltip>
          </React.Fragment>
        ) : null}
      </div>
    </div>
  );
};
