import { Button, Space, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Icon, { SearchOutlined } from "@ant-design/icons";
import React, { useState } from "react";

import { identificationStatus, pageType } from "../utils/constants";
import { identifyElements } from "../store/thunks/identifyElements";
import { openSettingsMenu } from "../services/pageDataHandlers";
import { MUI_PREDICT, HTML5_PREDICT } from "../services/backend";

import Settings from "../assets/settings.svg";
import { selectCurrentPage } from "../store/selectors/mainSelectors";

export const GenerationButtons = ({ pageObj }) => {
  const status = useSelector((state) => state.locators.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const currentPage = useSelector(selectCurrentPage).page;
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);

  const dispatch = useDispatch();
  const [endpoint, setEndpoint] = useState(MUI_PREDICT);

  const renderSettingsButton = () => {
    return (
      <Button
        onClick={() => {
          openSettingsMenu(xpathConfig);
        }}
        className={["jdn__buttons", "jdn__buttons--secondary"]}
      >
        <Icon component={Settings} />
        Settings
      </Button>
    );
  };

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <Space direction="horizontal" size={8} align="center">
          <label htmlFor="library" className={`${!allowIdentifyElements ? "jdn__label--disabled" : ""}`}>
            Library:
          </label>
          <Select
            id="library"
            defaultValue={endpoint}
            disabled={!allowIdentifyElements}
            className="jdn__select"
            onChange={setEndpoint}
          >
            <Select.Option value={MUI_PREDICT}>Material UI</Select.Option>
            <Select.Option value={HTML5_PREDICT}>HTML 5</Select.Option>
          </Select>
        </Space>
        <Space direction="horizontal" size={8}>
          {(currentPage === pageType.locatorsList) && allowIdentifyElements ?
            renderSettingsButton() :
            null}
          <Button
            icon={<SearchOutlined />}
            type="primary"
            loading={status === identificationStatus.loading && currentPageObject === pageObj}
            disabled={!allowIdentifyElements}
            onClick={() => dispatch(identifyElements({ endpoint, pageObj }))}
            className="jdn__buttons"
          >
            Generate
          </Button>
        </Space>
      </Space>
    </div>
  );
};
