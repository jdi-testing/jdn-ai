import { Button, Popconfirm } from "antd";
import { BookOpen } from "phosphor-react";
import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectIsDefaultState } from "../main.selectors";
import { BackendStatus } from "../types/mainSlice.types";
import { OnboardingContext } from "../../features/onboarding/OnboardingProvider";
import { useOnBoardingRef } from "../../features/onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../features/onboarding/types/constants";

export const OnboardingButton = () => {
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  const isBackendAvailable =
    useSelector<RootState>((_state) => _state.main.backendAvailable) === BackendStatus.Accessed;

  const { openOnboarding } = useContext(OnboardingContext);

  const onbrdRef = useOnBoardingRef(OnbrdStep.Onboarding);

  return (
    <Popconfirm
      placement="bottomRight"
      disabled={!isBackendAvailable}
      title={
        isDefaultState
          ? "Would you like to start the onboarding?"
          : "Your current progress will not be saved. Are you sure you want to start the onboarding?"
      }
      onConfirm={() => openOnboarding()}
      okText="Start"
      cancelText="No"
    >
      <Button disabled={!isBackendAvailable} ref={onbrdRef} type="link" icon={<BookOpen size={14} color="#8C8C8C" />} />
    </Popconfirm>
  );
};
