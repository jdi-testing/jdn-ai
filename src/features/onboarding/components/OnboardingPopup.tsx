import React, { FC, useContext } from "react";
import { useSelector } from "react-redux";
import { Popconfirm } from "antd";
import { RootState } from "../../../app/store/store";
import { selectIsDefaultState } from "../../../app/main.selectors";
import { OnboardingContext } from "../OnboardingProvider";
import { OnboardingPopupText, OnboardingPopupButtons } from "../types/constants";

interface Props {
  children: React.ReactNode;
}

export const OnboardingPopup: FC<Props> = ({ children }) => {
  const { openOnboarding } = useContext(OnboardingContext);
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  const { isOnboardingAvailable } = useContext(OnboardingContext);

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
