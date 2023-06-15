import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Row, Space, Tooltip } from "antd";
import { CaretDown, Plus, Trash } from "phosphor-react";

import { addPageObj } from "../reducers/addPageObject.thunk";

import { pushNotification } from "../../../app/main.slice";
import { size } from "lodash";
import { selectPageObjects } from "../../pageObjects/pageObject.selectors";

import { removeAll as removeAllLocators } from "../../locators/locators.slice";
import { removeAll as removeAllPageObjects } from "../pageObject.slice";
import { removeAll as removeAllFilters } from "../../filter/filter.slice";
import { RootState } from "../../../app/store/store";
import { selectLocatorsToGenerate } from "../../locators/locators.selectors";
import { generateAndDownloadZip } from "../utils/projectTemplate";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { checkLocatorsValidity } from "../../locators/reducers/checkLocatorValidity.thunk";

const { confirm } = Modal;

interface Props {
  template?: Blob;
  toggleExpand: () => void;
  setActivePanel: (pageObjectId: string[] | undefined) => void;
  isExpanded: boolean;
}

export const PageObjListHeader: React.FC<Props> = ({ template, toggleExpand, isExpanded, setActivePanel }) => {
  const state = useSelector((state) => state) as RootState;
  const pageObjects = useSelector(selectPageObjects);
  const locatorsToGenerate = useSelector(selectLocatorsToGenerate);
  const enableDownload = useMemo(() => !!size(locatorsToGenerate), [locatorsToGenerate]);
  const newPOstub = pageObjects.find((pageObject) => !pageObject.locators?.length);

  const dispatch = useDispatch();

  const handleAddPageObject = () => {
    if (newPOstub) {
      setActivePanel([newPOstub.id.toString()]);
      return;
    }

    dispatch(addPageObj());
  };

  const handleDownload = () => {
    dispatch(pushNotification({ action: { type: "downloadTemplate" } }));
    if (template) generateAndDownloadZip(state, template);
  };

  const handleRemoveAll = () => {
    const isOnePO = size(pageObjects) === 1;
    confirm({
      title: isOnePO ? "Delete page object?" : "Delete all page objects?",
      content: isOnePO
        ? "This page object will be deleted and you can lose all your data"
        : "All page objects will be deleted and you can lose all your data",
      okText: isOnePO ? "Delete" : "Delete all",
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

  const newPoRef = useOnBoardingRef(OnbrdStep.NewPageObject, handleAddPageObject);
  const downloadRef = useOnBoardingRef(OnbrdStep.DownloadPO, undefined, () => dispatch(checkLocatorsValidity()));

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
          <Button ref={downloadRef} size="small" onClick={handleDownload}>
            Download all as .zip
          </Button>
        ) : null}
        <Button
          ref={newPoRef}
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
