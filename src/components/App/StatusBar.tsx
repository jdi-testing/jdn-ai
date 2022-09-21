import { Space, Dropdown, Typography, Tooltip } from "antd";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React from "react";

import kebab_menu from "../../assets/Kebab_menu.svg";
import { readmeLinkAddress } from "../../utils/constants";
import { RootState } from "../../store/store";
import { isNil } from "lodash";
import { Menu, MenuItem } from "../common/Menu";
import { BackendStatus, LocalUrl } from "../../store/slices/mainSlice.types";
import { CloudCheck, DesktopTower } from "phosphor-react";
import { LocatorsGenerationStatus } from "../../store/slices/locatorSlice.types";
import { ReportProblem } from "../ReportProblem/ReportProblem";

export const StatusBar = () => {
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const backendAvailable = useSelector<RootState>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState>((_state) => _state.main.baseUrl);
  const generationStatus = useSelector<RootState>((_state) => _state.locators.generationStatus);

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;

  const kebabMenu = () => {
    const items: MenuItem[] = [
      {
        key: "0",
        onClick: undefined,
        label: (
          <a href={readmeLinkAddress} target="_blank" rel="noreferrer">
            Readme
          </a>
        ),
      },
    ];

    return <Menu {...{ items }} />;
  };

  const renderServerIndicator = () => {
    const locationIcon = serverLocation === LocalUrl ? <DesktopTower size={16} /> : <CloudCheck size={16} />;

    const title =
      generationStatus === LocatorsGenerationStatus.failed ?
        "No connection" :
        serverLocation === LocalUrl ?
        "Local server" :
        "Remote server";

    return backendAvailable === BackendStatus.Accessed ? (
      <Tooltip placement="bottomRight" align={{ offset: [12, 0] }} title={title}>
        {generationStatus === LocatorsGenerationStatus.failed ? (
          <Typography.Text type="danger">{locationIcon}</Typography.Text>
        ) : (
          locationIcon
        )}
      </Tooltip>
    ) : null;
  };

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <span>{`JDN v ${pluginVer} ${!isNil(backendVer) ? `Back-end v ${backendVer}` : ""}`}</span>
      </div>
      <Space size={[30, 0]} className="header__space">
        <ReportProblem />
        <a className="jdn__header-link" href={readmeLinkAddress} target="_blank" rel="noreferrer">
          Readme
        </a>
        <span className="jdn__header-kebab">
          <Dropdown overlay={kebabMenu} trigger={["click"]} arrow={{ pointAtCenter: true }}>
            <Icon component={kebab_menu} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </span>
        <span>{renderServerIndicator()}</span>
      </Space>
    </React.Fragment>
  );
};
