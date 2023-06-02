import React, { useContext, useEffect } from "react";
import { Tour } from "antd5";
import { getPOPageSteps } from "./utils/tourSteps";
import { OnboardingContext } from "./OnboardingProvider";

export const Onboarding = () => {
  const { defaultStep, isOpen, stepRefs, closeOnboarding } = useContext(OnboardingContext);
  const [currentStep, setCurrentStep] = React.useState<number | undefined>();

  const tourSteps = getPOPageSteps(stepRefs);

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

  return <Tour open={isOpen} steps={tourSteps} current={currentStep} onClose={() => closeOnboarding()} onChange={handleOnChange} />;
};
