import { Button, Space, Tooltip, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";

import { isNil } from "lodash";
import { CloudCheck, CloudSlash, DesktopTower, Info } from "phosphor-react";
import DesktopSlash from "../../assets/desktopTowerSlash.svg";
import { LocatorsGenerationStatus } from "../../store/slices/locatorSlice.types";
import { BackendStatus, LocalUrl } from "../../store/slices/mainSlice.types";
import { RootState } from "../../store/store";
import { readmeLinkAddress } from "../../utils/constants";
import { ReportProblem } from "../ReportProblem/ReportProblem";

export const StatusBar = () => {
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const backendAvailable = useSelector<RootState>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState>((_state) => _state.main.baseUrl);
  const generationStatus = useSelector<RootState>((_state) => _state.locators.generationStatus);

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;

  const renderServerIndicator = () => {
    const locationIcon =
      serverLocation === LocalUrl ? (
        <DesktopTower size={16} color="#8C8C8C" />
      ) : (
        <CloudCheck size={16} color="#8C8C8C" />
      );
    const errorLocationIcon = serverLocation === LocalUrl ? <DesktopSlash /> : <CloudSlash size={16} color="#8C8C8C" />;

    const title =
      generationStatus === LocatorsGenerationStatus.failed ?
        "No connection" :
        serverLocation === LocalUrl ?
        "Local server" :
        "Remote server";

    return backendAvailable === BackendStatus.Accessed ? (
      <Tooltip placement="bottomRight" align={{ offset: [12, 0] }} title={title}>
        <Button type="link" icon={
          generationStatus === LocatorsGenerationStatus.failed ? (
          <Typography.Text type="danger">{errorLocationIcon}</Typography.Text>
        ) : (
          locationIcon
        )
        }>
        </Button>
      </Tooltip>
    ) : null;
  };

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <span>{`JDN v ${pluginVer} ${!isNil(backendVer) ? `Back-end v ${backendVer}` : ""}`}</span>
      </div>
      <Space size={[10, 0]} className="header__space">
        <Tooltip title="Readme" trigger="click">
          <Button type="link" href={readmeLinkAddress} target="_blank" icon={<Info size={14} color="#8C8C8C" />} />
        </Tooltip>
        <ReportProblem />
        <span className="jdn_header-connection">{renderServerIndicator()}</span>
      </Space>
    </React.Fragment>
  );
};
