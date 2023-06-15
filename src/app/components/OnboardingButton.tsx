import { Button, Popconfirm, Tooltip } from "antd";
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
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const isDefaultState = useSelector<RootState>(selectIsDefaultState);
  const isOnboardingAvailable =
    useSelector<RootState>((_state) => _state.main.backendAvailable) === BackendStatus.Accessed;

  const { openOnboarding } = useContext(OnboardingContext);

  const onbrdRef = useOnBoardingRef(OnbrdStep.Onboarding);

  return (
    <Popconfirm
      placement="bottomRight"
      align={{ offset: [18, 0] }}
      disabled={!isOnboardingAvailable}
      title={
        isDefaultState
          ? "Would you like to start the onboarding?"
          : "Your current progress will not be saved. Are you sure you want to start the onboarding?"
      }
      onConfirm={openOnboarding}
      okText="Start"
      cancelText="No"
    >
      <Tooltip placement="bottomRight" open={isTooltipVisible} align={{ offset: [16, 0] }} title="Onboarding tutorial">
        <Button
          disabled={!isOnboardingAvailable}
          ref={onbrdRef}
          type="link"
          icon={<BookOpen size={14} color="#8C8C8C" />}
          onClick={() => setIsTooltipVisible(false)}
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
        />
      </Tooltip>
    </Popconfirm>
  );
};
