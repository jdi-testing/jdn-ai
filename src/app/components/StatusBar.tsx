import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Space, Tooltip, Typography } from 'antd';

import { isNil } from 'lodash';
import { CloudCheck, CloudSlash, DesktopTower, Info } from '@phosphor-icons/react';
import { BackendStatus } from '../types/mainSlice.types';
import { URL, componentsTexts } from '../utils/constants';
import { RootState } from '../store/store';
import DesktopSlash from '../assets/desktopTowerSlash.svg';
import { readmeLinkAddress } from '../../common/constants/constants';
import { ReportProblem } from './ReportProblem';
import { LocatorsGenerationStatus } from '../../features/locators/types/locator.types';
import { OnboardingButton } from './OnboardingButton';
import { OnboardingStep } from '../../features/onboarding/constants';
import { useOnboardingContext } from '../../features/onboarding/OnboardingProvider';

type TServerIndicator = {
  backendAvailable: BackendStatus;
  serverLocation: string;
  generationStatus: LocatorsGenerationStatus;
};

const getTitle = (generationStatus: LocatorsGenerationStatus, serverLocation: string) => {
  if (generationStatus === LocatorsGenerationStatus.failed) {
    return componentsTexts.StatusBarServerNoConnection;
  } else if (serverLocation === URL.local) {
    return componentsTexts.StatusBarLocalServer;
  } else {
    return componentsTexts.StatusBarRemoteServer;
  }
};

const ServerIndicator: FC<TServerIndicator> = ({ backendAvailable, serverLocation, generationStatus }) => {
  const locationIcon =
    serverLocation === URL.local ? (
      <DesktopTower size={16} color="#8C8C8C" />
    ) : (
      <CloudCheck size={16} color="#8C8C8C" />
    );
  const errorLocationIcon = serverLocation === URL.local ? <DesktopSlash /> : <CloudSlash size={16} color="#8C8C8C" />;

  const connectionRef = React.createRef<HTMLElement>();
  const { updateStepRefs } = useOnboardingContext();

  useEffect(() => {
    if (connectionRef.current) {
      updateStepRefs(OnboardingStep.Connection, connectionRef);
    }
  }, [backendAvailable, serverLocation, generationStatus]);

  const title = () => getTitle(generationStatus, serverLocation);

  return backendAvailable === BackendStatus.Accessed ? (
    <Tooltip placement="bottomRight" align={{ offset: [12, 0] }} title={title}>
      <Button
        ref={connectionRef}
        style={{ cursor: 'default' }}
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
  ) : (
    <></>
  );
};

export const StatusBar = () => {
  const backendVer = useSelector<RootState, string>((_state) => _state.main.serverVersion ?? '');
  const backendAvailable = useSelector<RootState, BackendStatus>((_state) => _state.main.backendAvailable);
  const serverLocation = useSelector<RootState, string>((_state) => _state.main.baseUrl ?? '');
  const generationStatus = useSelector<RootState, LocatorsGenerationStatus>(
    (_state) => _state.locators.present.generationStatus,
  );

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);

  const readmeRef = React.createRef<HTMLElement>();

  const { updateStepRefs } = useOnboardingContext();

  useEffect(() => {
    updateStepRefs(OnboardingStep.Readme, readmeRef);
  }, []);

  return (
    <>
      <div className="jdn__header-version">
        <span>{`${componentsTexts.StatusBarVersionJdn} ${pluginVer} ${
          !isNil(backendVer) ? `${componentsTexts.StatusBarVersionBackend} ${backendVer}` : ''
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
        <ServerIndicator
          backendAvailable={backendAvailable}
          serverLocation={serverLocation}
          generationStatus={generationStatus}
        />
      </Space>
    </>
  );
};
