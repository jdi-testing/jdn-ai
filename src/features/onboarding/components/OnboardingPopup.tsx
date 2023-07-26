import React, { FC, useContext } from "react";
import { useSelector } from "react-redux";
import { Popconfirm } from "antd";
import { RootState } from "../../../app/store/store";
import { selectIsDefaultState } from "../../../app/main.selectors";
import { OnboardingContext } from "../OnboardingProvider";
import { BackendStatus } from "../../../app/types/mainSlice.types";
import { OnboardingPopupText, OnboardingPopupButtons } from "../types/constants";

interface Props {
  children: React.ReactNode;
}

export const OnboardingPopup: FC<Props> = ({ children }) => {
  const { openOnboarding } = useContext(OnboardingContext);
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  const isOnboardingAvailable =
    useSelector<RootState>((_state) => _state.main.backendAvailable) === BackendStatus.Accessed;

  return (
    <Popconfirm
      overlayClassName="jdn__header-onboarding-button"
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
