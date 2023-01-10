import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Row, Space, Tooltip } from "antd";
import { CaretDown, DownloadSimple, Plus, Trash } from "phosphor-react";

import { addPageObj } from "./addPageObject";
import { generateAndDownloadZip } from "../../utils/pageObject";

import { pushNotification } from "../../../../app/mainSlice";
import { size } from "lodash";
import { selectPageObjects } from "../../pageObjectSelectors";

import { selectLocatorsToGenerate } from "../../../locators/locatorSelectors";
import { removeAll as removeAllLocators } from "../../../locators/locatorsSlice";
import { removeAll as removeAllPageObjects } from "../../pageObjectSlice";
import { removeAll as removeAllFilters } from "../../../filter/filterSlice";
import { RootState } from "../../../../app/store";

const { confirm } = Modal;

interface Props {
  template: Blob;
  toggleExpand: () => void;
  setActivePanel: (pageObjectId: string[]) => void;
  isExpanded: boolean;
}

export const PageObjListHeader: React.FC<Props> = ({ template, toggleExpand, isExpanded, setActivePanel }) => {
  const state = useSelector((state) => state) as RootState;
  const pageObjects = useSelector(selectPageObjects);
  const locatorsToGenerate = useSelector(selectLocatorsToGenerate);
  const enableDownload = useMemo(() => !!size(locatorsToGenerate), [locatorsToGenerate]);
  const newPOstub = pageObjects.find((pageObject) => !pageObject.locators?.length);
  const isSomePOcreated = pageObjects.some((pageObject) => pageObject.locators?.length);

  const dispatch = useDispatch();

  const handleAddPageObject = () => {
    if (newPOstub || (isSomePOcreated && newPOstub)) {
      setActivePanel([newPOstub.id]);
      return;
    }

    dispatch(addPageObj());
  };

  const handleDownload = () => {
    dispatch(pushNotification({ action: { type: "downloadTemplate" } }));
    generateAndDownloadZip(state, template);
  };

  const handleRemoveAll = () => {
    confirm({
      title: size(pageObjects) === 1 ? "Delete this page object?" : "Delete these page objects?",
      content: `All page objects and packages will be cleared and you can lose all your data.
      You cannot undo this action.`,
      okText: "Delete all",
      // okType: "danger",
      okButtonProps: {
        type: "primary",
        danger: true,
      },
      onOk: () => {
        dispatch(removeAllLocators());
        dispatch(removeAllPageObjects());
        dispatch(removeAllFilters());
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
        onClick={toggleExpand}
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
        <Button
          type="primary"
          size="small"
          onClick={handleAddPageObject}
          disabled={!!newPOstub}
          icon={<Plus size={16} color={newPOstub ? "#00000040" : "#fff"} />}
        >
          Page object
        </Button>
      </Space>
    </Row>
  );
};
