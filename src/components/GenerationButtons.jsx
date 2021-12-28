import { Button, Space } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Icon, { SearchOutlined } from "@ant-design/icons";
import React from "react";

import { autoFindStatus } from "../utils/constants";
import { clearAll } from "../store/predictionSlice";
import { identifyElements } from "../store/thunks/identifyElements";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { openSettingsMenu } from "../services/pageDataHandlers";
import { sendMessage } from "../services/connector";

import ClearAllSvg from "../assets/clear-all.svg";
import Settings from "../assets/settings.svg";

export const GenerationButtons = () => {
  const status = useSelector((state) => state.main.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const allowRemoveElements = useSelector((state) => state.main.allowRemoveElements);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const dispatch = useDispatch();

  const handleClearAll = () => {
    dispatch(clearAll());
    sendMessage.killHighlight();
    locatorGenerationController.revokeAll();
  };

  return (
    <div className="jdn__generationButtons">
      <Space direction="horizontal" size={16}>
        <Button
          icon={<SearchOutlined />}
          type="primary"
          loading={status === autoFindStatus.loading}
          disabled={!allowIdentifyElements}
          onClick={() => dispatch(identifyElements())}
          className="jdn__buttons"
        >
          Identify
        </Button>
        <Button
          hidden={!allowIdentifyElements}
          onClick={() => {
            openSettingsMenu(xpathConfig);
          }}
          className="jdn__buttons"
        >
          <Icon component={Settings} className="jdn__buttons-icons" />
          Settings
        </Button>
        <Button hidden={!allowRemoveElements} onClick={handleClearAll} className="jdn__buttons">
          <Icon component={ClearAllSvg} />
          Clear all
        </Button>
      </Space>
    </div>
  );
};
