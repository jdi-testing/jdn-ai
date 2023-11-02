import React, { useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { BookOpen } from '@phosphor-icons/react';
import { OnboardingPopup } from '../../features/onboarding/components/OnboardingPopup';
import { componentsTexts } from '../utils/constants';
import { OnboardingStep } from '../../features/onboarding/constants';
import { useOnboardingContext } from '../../features/onboarding/OnboardingProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { BackendStatus } from '../types/mainSlice.types';
import { useOnboarding } from '../../features/onboarding/useOnboarding';

export const OnboardingButton = () => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  const isBackendAvailable = useSelector((state: RootState) => state.main.backendAvailable) === BackendStatus.Accessed;

  const { updateStepRefs } = useOnboardingContext();
  const { isOnboardingOpen } = useOnboarding();

  const onboardingButtonRef = React.createRef<HTMLElement>();

  useEffect(() => {
    if (onboardingButtonRef.current) {
      updateStepRefs(OnboardingStep.Onboarding, onboardingButtonRef);
    }
  }, []);

  const isOnboardingAvailable = isBackendAvailable && !isOnboardingOpen;

  return (
    <OnboardingPopup>
      <Tooltip
        placement="bottomRight"
        open={isTooltipVisible}
        align={{ offset: [16, 0] }}
        title={componentsTexts.OnboardingButtonTitle}
      >
        <div ref={onboardingButtonRef as React.LegacyRef<HTMLDivElement>}>
          <Button
            disabled={!isOnboardingAvailable}
            type="link"
            icon={<BookOpen size={14} color="#8C8C8C" />}
            onClick={() => setIsTooltipVisible(false)}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
          />
        </div>
      </Tooltip>
    </OnboardingPopup>
  );
};
