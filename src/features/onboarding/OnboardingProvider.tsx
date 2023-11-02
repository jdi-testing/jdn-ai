/* eslint-disable max-len */
import React, { ReactNode, createContext, useContext, useState } from 'react';
import { convertOnboardingStepsToTourSteps } from './utils/convertOnboardingStepsToTourSteps';
import { IOnboardingStep, OnboardingStep, TNextButtonProps, TPrevButtonProps, onboardingMap } from './constants';
import { IOnboardingContext } from './types/context.types';
import { TourStepProps } from 'antd/lib';

// ToDo move to utils
const convertUpdatedStepsToTourSteps = (
  updatedSteps: IOnboardingStep[],
  isCustomLocatorFlow: boolean,
): TourStepProps[] => {
  const result: IOnboardingStep[] = !isCustomLocatorFlow
    ? updatedSteps.filter((stepData) => stepData.order !== OnboardingStep.EditLocator)
    : updatedSteps;

  const tourSteps = result.map((stepData) => {
    if (stepData.order === OnboardingStep.CustomLocator) {
      stepData.nextButtonProps = {
        children: isCustomLocatorFlow ? 'Create custom locator' : 'Next',
        onClick: undefined,
      };
    }

    if (stepData.order === OnboardingStep.AddToPO) {
      stepData.prevButtonProps = {
        style: { display: isCustomLocatorFlow ? 'none' : 'inline-block' },
      };
    }

    return {
      title: stepData.title,
      description: stepData.description,
      target: stepData.target?.current,
      nextButtonProps: stepData.nextButtonProps,
      prevButtonProps: stepData.prevButtonProps,
    };
  });

  return tourSteps;
};

const initialContext = {
  stepsRef: [],
  updateStepRefs: () => [],
  modifyStepRefByKey: () => [],
};
const OnboardingContext = createContext(initialContext as IOnboardingContext);

export const useOnboardingContext = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<TourStepProps[]>(convertOnboardingStepsToTourSteps(onboardingMap));

  const updateStepRefs = (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    onClick?: (() => void) | undefined,
    onboardingStepsMap: Map<OnboardingStep, IOnboardingStep> = onboardingMap,
  ): void => {
    const updatedSteps: IOnboardingStep[] = Array.from(onboardingStepsMap.values()).map((stepData) => {
      let target: React.RefObject<HTMLElement> | null | undefined = undefined;
      if (key === stepData.order) {
        stepData.target = stepRef;
        if (stepData.nextButtonProps) {
          stepData.nextButtonProps.onClick = onClick;
        }
        target = stepData.target ?? stepRef;
      }

      const res: IOnboardingStep = {
        order: stepData.order,
        title: stepData.title,
        description: stepData.description,
        target: target ?? stepData.target,
        nextButtonProps: stepData.nextButtonProps,
        prevButtonProps: stepData.prevButtonProps,
      };
      return res;
    });

    setSteps(convertUpdatedStepsToTourSteps(updatedSteps, false)); // ToDo rewrite hardcode to data from slice(isCustomLocatorFlow)
  };

  const modifyStepRefByKey = (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    nextButtonProps?: TNextButtonProps,
    prevButtonProps?: TPrevButtonProps,
    onboardingStepsMap: Map<OnboardingStep, IOnboardingStep> = onboardingMap,
  ): IOnboardingStep[] => {
    const updatedSteps = [...onboardingStepsMap.values()].map((stepData) => {
      if (key === stepData.order) {
        stepData.target = stepRef;
        if (nextButtonProps) {
          stepData.nextButtonProps = nextButtonProps;
        }
        if (prevButtonProps) {
          stepData.prevButtonProps = prevButtonProps;
        }
      }
      return stepData;
    });

    setSteps(convertUpdatedStepsToTourSteps(updatedSteps, false)); // ToDo rewrite hardcode to data from slice(isCustomLocatorFlow)

    return updatedSteps;
  };

  return (
    <OnboardingContext.Provider value={{ stepsRef: steps, updateStepRefs, modifyStepRefByKey }}>
      {children}
    </OnboardingContext.Provider>
  );
};
