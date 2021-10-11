import Icon, {SearchOutlined} from "@ant-design/icons";
import {Button, Space} from "antd";
import React from "react";
import { autoFindStatus, useAutoFind } from "../autoFindProvider/AutoFindProvider";

import ClearAllSvg from "../../../../icons/clear-all.svg";
import Settings from '../../../../icons/settings.svg';
import { openSettingsMenu } from "../utils/pageDataHandlers";

export const GenerationButtons = () => {
  const [
    { status, allowIdentifyElements, allowRemoveElements, xpathConfig },
    { identifyElements, removeHighlighs },
  ] = useAutoFind();

  return (
    <div className="jdn__generationButtons">
      <Space direction="horizontal" size={16}>
        <Button
          icon={<SearchOutlined />}
          type="primary"
          loading={status === autoFindStatus.loading}
          disabled={!allowIdentifyElements}
          onClick={identifyElements}
          className="jdn__buttons"
        >
          Identify
        </Button>
        <Button onClick={() => {
          openSettingsMenu(xpathConfig);
        }} className="jdn__buttons" >
          <Icon component={Settings} className="jdn__buttons-icons" />
          Settings
        </Button>
        <Button hidden={!allowRemoveElements} onClick={removeHighlighs} className="jdn__buttons">
          <Icon component={ClearAllSvg} />
          Clear all
        </Button>
      </Space>
    </div>
  );
};
