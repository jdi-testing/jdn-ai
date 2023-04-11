import { Button, Space, Tooltip, Typography } from "antd";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

import { isNil } from "lodash";
import { CloudCheck, CloudSlash, DesktopTower, Info } from "phosphor-react";
import { BackendStatus } from "../types/mainSlice.types";
import { LocalUrl } from "../utils/constants";
import { RootState } from "../store/store";
import DesktopSlash from "../assets/desktopTowerSlash.svg";
import { readmeLinkAddress } from "../../common/constants/constants";
import { ReportProblem } from "./ReportProblem";
import { LocatorsGenerationStatus } from "../../features/locators/types/locator.types";
import { Tour } from "antd5";
import { TourProps } from "antd5/es/tour/interface";

export const StatusBar = () => {
  const [open, setOpen] = useState<boolean>(true);
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const backendAvailable = useSelector<RootState>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState>((_state) => _state.main.baseUrl);
  const generationStatus = useSelector<RootState>((_state) => _state.locators.present.generationStatus);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;

  const steps: TourProps['steps'] = [
    {
      title: 'Upload File',
      description: 'Put your files here.',
      cover: (
        <img
          alt="tour.png"
          src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
        />
      ),
      target: () => ref1.current,
    },
    {
      title: 'Save',
      description: 'Save your changes.',
      target: () => ref2.current,
    },
    {
      title: 'Other Actions',
      description: 'Click to see other actions.',
      target: () => ref3.current,
    },
  ];

  const renderServerIndicator = () => {
    const locationIcon =
      serverLocation === LocalUrl ? (
        <DesktopTower size={16} color="#8C8C8C" />
      ) : (
        <CloudCheck size={16} color="#8C8C8C" />
      );
    const errorLocationIcon = serverLocation === LocalUrl ? <DesktopSlash /> : <CloudSlash size={16} color="#8C8C8C" />;

    const title =
      generationStatus === LocatorsGenerationStatus.failed
        ? "No connection"
        : serverLocation === LocalUrl
        ? "Local server"
        : "Remote server";

    return backendAvailable === BackendStatus.Accessed ? (
      <Tooltip placement="bottomRight" align={{ offset: [12, 0] }} title={title}>
        <Button
          ref={ref1}
          type="link"
          icon={
            generationStatus === LocatorsGenerationStatus.failed ? (
              <Typography.Text type="danger">{errorLocationIcon}</Typography.Text>
            ) : (
              locationIcon
            )
          }
        ></Button>
      </Tooltip>
    ) : null;
  };

  return (
    <React.Fragment>
      <div ref={ref2} className="jdn__header-version">
        <span>{`JDN v ${pluginVer} ${!isNil(backendVer) ? `Back-end v ${backendVer}` : ""}`}</span>
      </div>
      <Space size={[10, 0]} className="header__space">
        <Tooltip title="Readme">
          <Button ref={ref3} type="link" href={readmeLinkAddress} target="_blank" icon={<Info size={14} color="#8C8C8C" />} />
        </Tooltip>
        <ReportProblem />
        <span className="jdn_header-connection">{renderServerIndicator()}</span>
      </Space>
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </React.Fragment>
  );
};
