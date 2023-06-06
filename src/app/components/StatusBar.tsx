import { Button, Space, Tooltip, Typography } from "antd";
import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { isNil } from "lodash";
import { BookOpen, CloudCheck, CloudSlash, DesktopTower, Info } from "phosphor-react";
import { BackendStatus } from "../types/mainSlice.types";
import { LocalUrl } from "../utils/constants";
import { RootState } from "../store/store";
import DesktopSlash from "../assets/desktopTowerSlash.svg";
import { readmeLinkAddress } from "../../common/constants/constants";
import { ReportProblem } from "./ReportProblem";
import { LocatorsGenerationStatus } from "../../features/locators/types/locator.types";
import { OnboardingContext } from "../../features/onboarding/OnboardingProvider";
import { useOnBoardingRef } from "../../features/onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../features/onboarding/types/constants";

export const StatusBar = () => {
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const backendAvailable = useSelector<RootState>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState>((_state) => _state.main.baseUrl);
  const generationStatus = useSelector<RootState>((_state) => _state.locators.present.generationStatus);
  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;
  const { openOnboarding } = useContext(OnboardingContext);

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

  const onbrdRef = useOnBoardingRef(OnbrdStep.Onboarding);
  const readmedRef = useOnBoardingRef(OnbrdStep.Readme);
  const connectionRef = useOnBoardingRef(OnbrdStep.Connection);

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <span>{`JDN v ${pluginVer} ${!isNil(backendVer) ? `Back-end v ${backendVer}` : ""}`}</span>
      </div>
      <Space size={[10, 0]} className="header__space">
        <Button
          ref={onbrdRef}
          type="link"
          icon={<BookOpen size={14} color="#8C8C8C" />}
          onClick={() => openOnboarding()}
        />
        <Tooltip title="Readme">
          <Button
            ref={readmedRef}
            type="link"
            href={readmeLinkAddress}
            target="_blank"
            icon={<Info size={14} color="#8C8C8C" />}
          />
        </Tooltip>
        <ReportProblem />
        <span ref={connectionRef} className="jdn_header-connection">
          {renderServerIndicator()}
        </span>
      </Space>
    </React.Fragment>
  );
};
