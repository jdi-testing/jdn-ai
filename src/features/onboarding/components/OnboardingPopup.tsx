import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { RootState } from '../../../app/store/store';
import { selectIsDefaultState } from '../../../app/main.selectors';
// import { OnboardingContext } from '../OnboardingProvider';
import { OnboardingPopupText, OnboardingPopupButtons } from '../constants';
import { useOnboarding } from '../useOnboarding';

interface Props {
  children: React.ReactNode;
}

export const OnboardingPopup: FC<Props> = ({ children }) => {
  const { openModal } = useOnboarding();
  // const { openOnboarding } = useContext(OnboardingContext);
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  // const { isOnboardingAvailable } = useContext(OnboardingContext);
  const isOnboardingAvailable = true; // fix for real cases

  return (
    <Popconfirm
      className="onboarding-popup"
      overlayClassName="onboarding-popup__overlay"
      placement="bottomRight"
      align={{ offset: [18, 0] }}
      icon={false}
      disabled={!isOnboardingAvailable}
      title={isDefaultState ? OnboardingPopupText.Default : OnboardingPopupText.InProgress}
      onConfirm={openModal}
      okText={OnboardingPopupButtons.Ok}
      cancelText={OnboardingPopupButtons.Cancel}
    >
      {children}
    </Popconfirm>
  );
};
