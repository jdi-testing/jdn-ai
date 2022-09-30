import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Row, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import { Trash } from "phosphor-react";

import { addPageObj } from "../../../store/thunks/addPageObject";
import { generateAndDownloadZip } from "../utils/pageObject";

import PlusSvg from "../../../assets/plus.svg";
import DownloadSvg from "../../../assets/download.svg";
import { pushNotification, toggleBackdrop } from "../../../store/slices/mainSlice";
import { size } from "lodash";
import { selectPageObjects } from "../../../store/selectors/pageObjectSelectors";

import { selectLocatorsToGenerate } from "../../../store/selectors/locatorSelectors";
import { removeAll as removeAllLocators } from "../../../store/slices/locatorsSlice";
import { removeAll as removeAllPageObjects } from "../../../store/slices/pageObjectSlice";

const { confirm } = Modal;

export const PageObjListHeader = ({ template }) => {
  const state = useSelector((state) => state);
  const pageObjects = useSelector(selectPageObjects);
  const locatorsToGenerate = useSelector(selectLocatorsToGenerate);
  const enableDownload = useMemo(() => !!size(locatorsToGenerate), [locatorsToGenerate]);

  const dispatch = useDispatch();
  const handleAddPageObject = () => dispatch(addPageObj());

  const handleDownload = () => {
    dispatch(pushNotification("Download"));
    generateAndDownloadZip(state, template);
  };

  const handleRemoveAll = () => {
    // openDeleteAllPopup();
    confirm({
      title: "Delete all",
      content: `All page objects and packages will be cleared and you can lose all your data. 
      You cannot undo this action.`,
      okText: "Delete all",
      okType: "danger",
      onOk: () => {
        dispatch(removeAllPageObjects());
        dispatch(removeAllLocators());
        dispatch(toggleBackdrop(false));
      }
    });
  };

  return (
    <Row className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title"></span>
      <div className="jdn__locatorsList-header-buttons">
        <Button className="jdn__buttons" onClick={handleAddPageObject}>
          <Icon component={PlusSvg} />
          New page object
        </Button>
        {size(pageObjects) ? (
          <Tooltip placement="bottom" title="Delete all">
            <Button hidden={!size(pageObjects)} danger onClick={handleRemoveAll} data-testid="remove-button">
              <Trash color="#D82C15" size={18} />
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
    </Row>
  );
};
