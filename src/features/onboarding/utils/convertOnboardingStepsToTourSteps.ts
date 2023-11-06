import { TourStepProps } from 'antd/lib/tour/interface';
import { IOnboardingStep, OnboardingStep } from '../constants';

export const convertOnboardingStepsToTourSteps = (
  onboardingStepsMap: Map<OnboardingStep, IOnboardingStep>,
): TourStepProps[] => {
  const steps: TourStepProps[] = [];
  onboardingStepsMap.forEach((stepData) => {
    steps.push({
      title: stepData.title,
      description: stepData.description,
      target: stepData.target?.current,
      nextButtonProps: stepData.nextButtonProps,
      prevButtonProps: stepData.prevButtonProps,
    });
  });
  return steps;
};
