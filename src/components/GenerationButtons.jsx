import { Button, Space, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Icon, { SearchOutlined } from "@ant-design/icons";
import React, { useState } from "react";

import { autoFindStatus } from "../utils/constants";
import { clearAll } from "../store/predictionSlice";
import { identifyElements } from "../store/thunks/identifyElements";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { openSettingsMenu } from "../services/pageDataHandlers";
import { sendMessage } from "../services/connector";
import { MUI_PREDICT, HTML5_PREDICT } from "../services/backend";

import ClearAllSvg from "../assets/clear-all.svg";
import Settings from "../assets/settings.svg";

export const GenerationButtons = () => {
  const status = useSelector((state) => state.main.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const allowRemoveElements = useSelector((state) => state.main.allowRemoveElements);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const dispatch = useDispatch();
  const [endpoint, setEndpoint] = useState(MUI_PREDICT);

  const handleClearAll = () => {
    dispatch(clearAll());
    sendMessage.killHighlight();
    locatorGenerationController.revokeAll();
  };

  const handleEndpointSelect = (val) => {
    setEndpoint(val);
  };

  const renderSettingsButton = () => {
    return (
      <Button
        onClick={() => {
          openSettingsMenu(xpathConfig);
        }}
        className={[
          "jdn__buttons",
          "jdn__buttons--secondary"
        ]}
      >
        <Icon component={Settings} />
        Settings
      </Button>
    );
  };

  const renderClearAllButton = () => {
    return (
      <Button
        disabled={!allowRemoveElements}
        onClick={handleClearAll}
        className={[
          "jdn__buttons",
          "jdn__buttons--secondary"
        ]}
      >
        <Icon
          component={ClearAllSvg}
          className={`${!allowRemoveElements ? "jdn__icon--disabled" : ""}`}
        />
        Clear all
      </Button>
    );
  };

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <Space
          direction="horizontal"
          size={8}
          align="center"
        >
          <label
            htmlFor="library"
            className={`${!allowIdentifyElements ? "jdn__label--disabled" : ""}`}
          >
            Library:
          </label>
          <Select
            id="library"
            defaultValue={endpoint}
            disabled={!allowIdentifyElements}
            className="jdn__select"
            onChange={handleEndpointSelect}
          >
            <Select.Option value={MUI_PREDICT}>Material UI</Select.Option>
            <Select.Option value={HTML5_PREDICT}>HTML 5</Select.Option>
          </Select>
        </Space>
        <Space
          direction="horizontal"
          size={8}
        >
          {allowIdentifyElements ? renderSettingsButton() : renderClearAllButton()}
          <Button
            icon={<SearchOutlined />}
            type="primary"
            loading={status === autoFindStatus.loading}
            disabled={!allowIdentifyElements}
            onClick={() => dispatch(identifyElements(endpoint))}
            className="jdn__buttons"
          >
            Identify
          </Button>
        </Space>
      </Space>
    </div>
  );
};
