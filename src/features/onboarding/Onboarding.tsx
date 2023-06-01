import React, { useContext } from "react";
import { Tour } from "antd5";
import { getTourSteps } from "./utils/tourSteps";
import { OnboardingContext } from "./OnboardingProvider";

export const Onboarding = () => {
  const { isOpen, stepRefs, closeOnboarding } = useContext(OnboardingContext);

  const tourSteps = getTourSteps(stepRefs);

  console.log(tourSteps);
  console.log(stepRefs);

  return <Tour open={isOpen} steps={tourSteps} onClose={() => closeOnboarding()} />;
};
