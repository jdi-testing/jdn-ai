import React, { useContext, useEffect } from "react";
import { Tour, TourStepProps } from "antd5";
import { OnboardingContext } from "./OnboardingProvider";
import { StepIndicator } from "./components/stepIndicator";
import { useSelector } from "react-redux";
import { selectFirstLocatorByPO } from "../pageObjects/pageObject.selectors";
import { OnbrdStep } from "./types/constants";

export const Onboarding = () => {
  const { defaultStep, isOpen, tourSteps, closeOnboarding } = useContext(OnboardingContext);
  const [currentStep, setCurrentStep] = React.useState<number | undefined>();

  const isFirstLocatorChecked = useSelector(selectFirstLocatorByPO)?.generate;

  const _tourSteps = tourSteps?.map((step, index) => {
    if (index === OnbrdStep.AddToPO && isFirstLocatorChecked) {
      return {
        ...step,
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
    if (defaultStep !== undefined) {
      setCurrentStep(defaultStep);
    } else if (defaultStep && defaultStep > tourSteps!.length) {
      closeOnboarding();
    }
  }, [defaultStep]);

  return (
    <Tour
      open={isOpen}
      steps={_tourSteps as TourStepProps[]}
      current={currentStep}
      onClose={() => closeOnboarding()}
      onChange={handleOnChange}
      indicatorsRender={(current, total) => <StepIndicator {...{ current, total }} />}
    />
  );
};
