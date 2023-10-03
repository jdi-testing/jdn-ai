import React, { useContext, useEffect } from 'react';
import { Tour, TourStepProps } from 'antd';
import { OnboardingContext } from './OnboardingProvider';
import { StepIndicator } from './components/stepIndicator';
import { useSelector } from 'react-redux';
import { OnbrdStep } from './types/constants';
import { selectFirstLocatorByPO } from '../locators/selectors/locatorsByPO.selectors';
import { ONE_SECOND } from '../../common/constants/constants';

export const Onboarding = () => {
  const { defaultStep, isOpen, tourSteps, closeOnboarding } = useContext(OnboardingContext);
  const [currentStep, setCurrentStep] = React.useState<number | undefined>();

  const isFirstLocatorChecked = useSelector(selectFirstLocatorByPO)?.isChecked;

  const tourStepsStateMapped = tourSteps?.map((step, index) => {
    if (index === OnbrdStep.AddToPO && isFirstLocatorChecked) {
      return {
        ...step,
        description: 'Select the needed locators (or choose all of them) to create the final Page Object.',
        nextButtonProps: {
          disabled: false,
        },
      };
    } else return step;
  });

  const handleOnChange = (current: number) => {
    setCurrentStep(current);
  };

  useEffect(() => {
    if (
      defaultStep !== undefined &&
      (defaultStep !== OnbrdStep.CustomLocator || // this is a case for go Back correctly from DownloadPO to
        currentStep !== OnbrdStep.SaveLocators) // SaveLocators, because it's hard to set a default step from context
    ) {
      defaultStep === OnbrdStep.CustomLocator
        ? setTimeout(() => setCurrentStep(defaultStep), ONE_SECOND)
        : setCurrentStep(defaultStep);
    } else if (defaultStep && defaultStep > tourSteps!.length) {
      closeOnboarding();
    }
  }, [defaultStep]);

  return (
    <Tour
      open={isOpen}
      steps={tourStepsStateMapped as TourStepProps[]}
      current={currentStep}
      onClose={closeOnboarding}
      onChange={handleOnChange}
      indicatorsRender={(current, total) => <StepIndicator {...{ current, total }} />}
    />
  );
};
