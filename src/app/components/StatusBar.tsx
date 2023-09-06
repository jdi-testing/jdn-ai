import React from "react";
import { useSelector } from "react-redux";
import { Button, Space, Tooltip, Typography } from "antd";

import { isNil } from "lodash";
import { CloudCheck, CloudSlash, DesktopTower, Info } from "@phosphor-icons/react";
import { BackendStatus } from "../types/mainSlice.types";
import { LocalUrl } from "../utils/constants";
import { RootState } from "../store/store";
import DesktopSlash from "../assets/desktopTowerSlash.svg";
import { readmeLinkAddress } from "../../common/constants/constants";
import { ReportProblem } from "./ReportProblem";
import { LocatorsGenerationStatus } from "../../features/locators/types/locator.types";
import { useOnBoardingRef } from "../../features/onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../features/onboarding/types/constants";
import { OnboardingButton } from "./OnboardingButton";
import { componentsTexts } from "../utils/constants";

export const StatusBar = () => {
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const backendAvailable = useSelector<RootState>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState>((_state) => _state.main.baseUrl);
  const generationStatus = useSelector<RootState>((_state) => _state.locators.present.generationStatus);
  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);

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
        ? componentsTexts.StatusBarServerNoConnection
        : serverLocation === LocalUrl
        ? componentsTexts.StatusBarLocalServer
        : componentsTexts.StatusBarRemoteServer;

    return backendAvailable === BackendStatus.Accessed ? (
      <Tooltip placement="bottomRight" align={{ offset: [12, 0] }} title={title}>
        <Button
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

  const readmeRef = useOnBoardingRef(OnbrdStep.Readme);
  const connectionRef = useOnBoardingRef(OnbrdStep.Connection);

  return (
    <>
      <div className="jdn__header-version">
        <span>{`${componentsTexts.StatusBarVersionJdn} ${pluginVer} ${
          !isNil(backendVer) ? `${componentsTexts.StatusBarVersionBackend} ${backendVer}` : ""
        }`}</span>
      </div>
      <Space size={[10, 0]} className="header__space">
        {isSessionUnique && <OnboardingButton />}
        <Tooltip title={componentsTexts.StatusBarVersionReadme}>
          <Button
            ref={readmeRef}
            type="link"
            href={readmeLinkAddress}
            target="_blank"
            icon={<Info size={14} color="#8C8C8C" />}
          />
        </Tooltip>
        <ReportProblem />
        <div ref={connectionRef} className="jdn_header-connection">
          {renderServerIndicator()}
        </div>
      </Space>
    </>
  );
};
