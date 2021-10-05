import Icon, { SearchOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import React from "react";
import { autoFindStatus, useAutoFind, xpathGenerationStatus } from "../autoFindProvider/AutoFindProvider";

// import "./GenerationButtons.less";
import ClearAllSvg from "../../../../icons/clear-all.svg";
import DownloadSvg from "../../../../icons/download.svg";
import { Content } from "antd/lib/layout/layout";

export const GenerationButtons = () => {
  const [
    { status, allowIdentifyElements, allowRemoveElements, xpathStatus },
    { identifyElements, removeHighlighs, generateAndDownload },
  ] = useAutoFind();

  return (
    <Content>
      <Space direction="horizontal" size={16} >
        <Button
          icon={<SearchOutlined />}
          type="primary"
          loading={status == autoFindStatus.loading}
          disabled={!allowIdentifyElements}
          onClick={identifyElements}
          className="jdn__buttons"
        >
          Identify
        </Button>
        <Button hidden={!allowRemoveElements} onClick={removeHighlighs} className="jdn__buttons" >
          <Icon component={ClearAllSvg} className="jdn__buttons-icons" />
          Clear all
        </Button>
        <Button hidden={xpathStatus !== xpathGenerationStatus.complete} onClick={generateAndDownload} className="jdn__buttons">
          <Icon component={DownloadSvg} fill="#c15f0f" className="jdn__buttons-icons" />
          Download
        </Button>
      </Space>
    </Content>
  );
};
