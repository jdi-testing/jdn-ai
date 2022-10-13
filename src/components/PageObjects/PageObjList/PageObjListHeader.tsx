import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Row, Space, Tooltip } from "antd";
import { CaretDown, DownloadSimple, Plus, Trash } from "phosphor-react";

import { addPageObj } from "../../../store/thunks/addPageObject";
import { generateAndDownloadZip } from "../utils/pageObject";

import { pushNotification, toggleBackdrop } from "../../../store/slices/mainSlice";
import { size } from "lodash";
import { selectPageObjects } from "../../../store/selectors/pageObjectSelectors";

import { selectLocatorsToGenerate } from "../../../store/selectors/locatorSelectors";
import { removeAll as removeAllLocators } from "../../../store/slices/locatorsSlice";
import { removeAll as removeAllPageObjects } from "../../../store/slices/pageObjectSlice";

const { confirm } = Modal;

interface Props {
  template: Blob;
  toggleExpand: () => void;
  isExpanded: boolean;
}

export const PageObjListHeader: React.FC<Props> = ({ template, toggleExpand, isExpanded }) => {
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
      },
    });
  };

  return (
    <Row className="jdn__locatorsList-header" justify="space-between">
      <CaretDown
        style={{
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}
        className="jdn__locatorsList-header-collapse"
        color="#00000073"
        size={14}
        onClick={() => {
          console.log('clicked'); toggleExpand();
        }}
      />
      <Space direction="horizontal" size={8}>
        {size(pageObjects) ? (
        <Tooltip placement="bottom" title="Delete all">
          <Button
            danger
            size="small"
            onClick={handleRemoveAll}
            data-testid="remove-button"
            icon={<Trash color="#D82C15" size={16} />}
          />
        </Tooltip>
        ) : null}
        {enableDownload ? (
        <Tooltip placement="bottom" title="Download all">
          <Button size="small" onClick={handleDownload} icon={<DownloadSimple size={16} color="#595959" />} />
        </Tooltip>
        ) : null}
        <Button type="primary" size="small" onClick={handleAddPageObject} icon={<Plus size={16} color="#fff" />}>
          Page object
        </Button>
      </Space>
    </Row>
  );
};
