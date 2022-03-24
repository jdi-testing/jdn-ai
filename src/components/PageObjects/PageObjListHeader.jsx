import React, { useMemo } from "react";
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
import { openDeleteAllPopup } from "../../services/pageDataHandlers";
import { selectLocatorsToGenerate } from "../../store/selectors/locatorSelectors";

export const PageObjListHeader = () => {
  const state = useSelector((state) => state);
  const pageObjects = useSelector(selectPageObjects);
  const locatorsToGenerate = useSelector(selectLocatorsToGenerate);
  const enableDownload = useMemo(() => !!size(locatorsToGenerate), [locatorsToGenerate]);

  const dispatch = useDispatch();
  const handleAddPageObject = () => dispatch(addPageObj());

  const handleDownload = () => {
    dispatch(pushNotification("Download"));
    generateAndDownloadZip(state);
  };

  const handleRemoveAll = () => {
    openDeleteAllPopup();
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
          <Tooltip placement="bottom" title="Delete all">
            <Button hidden={!size(pageObjects)} danger onClick={handleRemoveAll} data-testid="remove-button">
              <Icon fill="#D82C15" component={TrashBinSVG} />
            </Button>
          </Tooltip>
        ) : null}
        {enableDownload ? (
          <Tooltip placement="bottom" title="Download all">
            <Button type="primary" onClick={handleDownload}>
              <Icon component={DownloadSvg} fill="#c15f0f" />
            </Button>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};
