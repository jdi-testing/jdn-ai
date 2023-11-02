import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { RootState } from '../../../app/store/store';
import { selectIsDefaultState } from '../../../app/main.selectors';
import { OnboardingPopupText, OnboardingPopupButtons } from '../constants';
import { useOnboarding } from '../useOnboarding';
import { BackendStatus } from '../../../app/types/mainSlice.types';

interface Props {
  children: React.ReactNode;
}

export const OnboardingPopup: FC<Props> = ({ children }) => {
  const { openOnboarding } = useOnboarding();
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  const isBackendAvailable = useSelector((state: RootState) => state.main.backendAvailable) === BackendStatus.Accessed;
  const { isOnboardingOpen } = useOnboarding();
  const isOnboardingAvailable = isBackendAvailable && !isOnboardingOpen;

  return (
    <Popconfirm
      className="onboarding-popup"
      overlayClassName="onboarding-popup__overlay"
      placement="bottomRight"
      align={{ offset: [18, 0] }}
      icon={false}
      disabled={!isOnboardingAvailable}
      title={isDefaultState ? OnboardingPopupText.Default : OnboardingPopupText.InProgress}
      onConfirm={openOnboarding}
      okText={OnboardingPopupButtons.Ok}
      cancelText={OnboardingPopupButtons.Cancel}
    >
      {children}
    </Popconfirm>
  );
};
