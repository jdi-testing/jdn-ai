import { Button, Tooltip } from 'antd';
import { BookOpen } from '@phosphor-icons/react';
import React, { useContext } from 'react';
import { useOnBoardingRef } from '../../features/onboarding/utils/useOnboardingRef';
import { OnboardingStep } from '../../features/onboarding/types/constants';
import { OnboardingPopup } from '../../features/onboarding/components/OnboardingPopup';
import { componentsTexts } from '../utils/constants';
import { OnboardingContext } from '../../features/onboarding/OnboardingProvider';

export const OnboardingButton = () => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const { isOnboardingAvailable } = useContext(OnboardingContext);

  const onbrdRef = useOnBoardingRef(OnboardingStep.Onboarding);

  return (
    <OnboardingPopup>
      <Tooltip
        placement="bottomRight"
        open={isTooltipVisible}
        align={{ offset: [16, 0] }}
        title={componentsTexts.OnboardingButtonTitle}
      >
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
    </OnboardingPopup>
  );
};
