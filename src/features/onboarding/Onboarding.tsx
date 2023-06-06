import React, { useContext, useEffect } from "react";
import { Tour } from "antd5";
import { OnboardingContext } from "./OnboardingProvider";
import { StepIndicator } from "./components/stepIndicator";

export const Onboarding = () => {
  const { defaultStep, isOpen, tourSteps, closeOnboarding } = useContext(OnboardingContext);
  const [currentStep, setCurrentStep] = React.useState<number | undefined>();

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
      steps={tourSteps}
      current={currentStep}
      onClose={() => closeOnboarding()}
      onChange={handleOnChange}
      indicatorsRender={(current, total) => <StepIndicator {...{ current, total }} />}
    />
  );
};
