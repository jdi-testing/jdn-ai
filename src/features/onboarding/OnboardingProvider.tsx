// For AnyAction, Dispatch:
/* eslint-disable import/named */
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { IOnboardingStep, OnboardingStep, TNextButtonProps, TPrevButtonProps, onboardingMap } from './constants';
import { IOnboardingContext } from './types/context.types';
import { TourStepProps } from 'antd/lib';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsCustomLocatorFlow } from './store/onboarding.selectors';
import { setIsCreatingFormOpen, setIsEditModalOpen } from '../locators/customLocator.slice';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';

// ToDo move to utils
const generateSteps = (
  stepsData: IOnboardingStep[],
  isCustomLocatorFlow: boolean,
  dispatch: Dispatch<AnyAction>,
): TourStepProps[] => {
  const result: IOnboardingStep[] = !isCustomLocatorFlow
    ? stepsData.filter((stepData) => stepData.order !== OnboardingStep.EditLocator)
    : stepsData;

  const tourSteps = result.map((stepData) => {
    const { order, title, description, target } = stepData;
    if (order === OnboardingStep.CustomLocator) {
      const addCustomLocatorHandler = () => {
        dispatch(setIsCreatingFormOpen(true));
        dispatch(setIsEditModalOpen(true));
      };
      if (stepData.nextButtonProps) {
        stepData.nextButtonProps.children = isCustomLocatorFlow ? 'Create custom locator' : 'Next';
        stepData.nextButtonProps.onClick = isCustomLocatorFlow ? addCustomLocatorHandler : undefined;
      }
    }

    if (stepData.order === OnboardingStep.AddToPO) {
      stepData.prevButtonProps = {
        style: { display: isCustomLocatorFlow ? 'none' : 'inline-block' },
      };
      stepData.title = isCustomLocatorFlow ? 'Add the locator to Page Object.' : 'Add the locator to the Page Object';
      stepData.description = isCustomLocatorFlow
        ? 'Custom locators are added as selected by default.'
        : 'Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.';
    }

    if (stepData.order === OnboardingStep.ContextMenu) {
      stepData.prevButtonProps = {
        style: { display: isCustomLocatorFlow ? 'none' : 'inline-block' },
      };
    }

    return {
      title,
      description,
      target: target?.current,
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
  const isCustomLocatorFlow = useSelector(selectIsCustomLocatorFlow);
  const dispatch = useDispatch();
  const [steps, setSteps] = useState(() =>
    generateSteps(Array.from(onboardingMap.values()), isCustomLocatorFlow, dispatch),
  );

  useEffect(() => {
    setSteps(generateSteps(Array.from(onboardingMap.values()), isCustomLocatorFlow, dispatch));
  }, [isCustomLocatorFlow]);

  const updateStepRefs = (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    onClickNext?: (() => void) | undefined,
    onClickPrev?: (() => void) | undefined,
    onboardingStepsMap: Map<OnboardingStep, IOnboardingStep> = onboardingMap,
  ): void => {
    const updatedSteps: IOnboardingStep[] = Array.from(onboardingStepsMap.values()).map((stepData) => {
      let target: React.RefObject<HTMLElement> | null | undefined = undefined;
      if (key === stepData.order) {
        stepData.target = stepRef;
        if (stepData.nextButtonProps) {
          stepData.nextButtonProps.onClick = onClickNext;
        }
        if (stepData.prevButtonProps) {
          stepData.prevButtonProps.onClick = onClickPrev;
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

    setSteps(generateSteps(updatedSteps, isCustomLocatorFlow, dispatch));
  };

  const modifyStepRefByKey = (
    key: OnboardingStep,
    stepRef?: React.RefObject<HTMLElement> | null | undefined,
    nextButtonProps?: TNextButtonProps,
    prevButtonProps?: TPrevButtonProps,
    onboardingStepsMap: Map<OnboardingStep, IOnboardingStep> = onboardingMap,
  ): IOnboardingStep[] => {
    const updatedSteps = [...onboardingStepsMap.values()].map((stepData) => {
      if (key === stepData.order) {
        if (stepRef) stepData.target = stepRef;

        if (nextButtonProps) {
          stepData.nextButtonProps = nextButtonProps;
        }
        if (prevButtonProps) {
          stepData.prevButtonProps = prevButtonProps;
        }
      }
      return stepData;
    });

    setSteps(generateSteps(updatedSteps, isCustomLocatorFlow, dispatch));

    return updatedSteps;
  };

  return (
    <OnboardingContext.Provider value={{ stepsRef: steps, updateStepRefs, modifyStepRefByKey }}>
      {children}
    </OnboardingContext.Provider>
  );
};
