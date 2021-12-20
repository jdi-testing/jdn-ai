import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Icon, { SearchOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { autoFindStatus } from "../autoFindProvider/AutoFindProvider";

import ClearAllSvg from "../../../../icons/clear-all.svg";
import Settings from "../../../../icons/settings.svg";
import { openSettingsMenu } from "../utils/pageDataHandlers";
import { clearAll } from "../redux/predictionSlice";
import { sendMessage } from "../utils/connector";
import { identifyElements } from "../redux/thunks/identifyElements";
import { locatorGenerationController } from "../utils/locatorGenerationController";

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
