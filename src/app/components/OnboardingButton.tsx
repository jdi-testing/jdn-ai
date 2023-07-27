import { Button, Tooltip } from "antd";
import { BookOpen } from "phosphor-react";
import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { BackendStatus } from "../types/mainSlice.types";
import { useOnBoardingRef } from "../../features/onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../features/onboarding/types/constants";
import { OnboardingPopup } from "../../features/onboarding/components/OnboardingPopup";
import { componentsTexts } from "../utils/constants";
import { OnboardingContext } from "../../features/onboarding/OnboardingProvider";

export const OnboardingButton = () => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const isOnboardingAvailable =
    useSelector<RootState>((_state) => _state.main.backendAvailable) === BackendStatus.Accessed;

  const { isOpen: isOnboardingOpen } = useContext(OnboardingContext);

  const onbrdRef = useOnBoardingRef(OnbrdStep.Onboarding);

  return (
    <OnboardingPopup>
      <Tooltip
        placement="bottomRight"
        open={isTooltipVisible}
        align={{ offset: [16, 0] }}
        title={componentsTexts.OnboardingButtonTitle}
      >
        <Button
          disabled={!isOnboardingAvailable || isOnboardingOpen}
          ref={onbrdRef}
          type="link"
          icon={<BookOpen size={14} color="#8C8C8C" />}
          onClick={() => setIsTooltipVisible(false)}
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
        />
      </Tooltip>
    </OnboardingPopup>
  );
};
