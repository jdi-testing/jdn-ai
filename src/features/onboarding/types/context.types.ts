import { MutableRefObject } from 'react';
import { IOnboardingStep, OnboardingStep, TNextButtonProps, TPrevButtonProps } from '../constants';

// import { IAddRefFunction } from '../OnboardingProvider';
import { TourStepProps } from 'antd/lib/tour/interface';

interface IAddRefFunction {
  // удалить или перенести поближе к его сущности
  (
    name: OnboardingStep,
    ref?: MutableRefObject<any> | null,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void,
  ): void;
}

export interface IOnboardingContext {
  // a step, that is set to Onboarding based on a state,
  // when user makes action that changes state and onboarding step should be changed
  // defaultStep?: number;
  // isCustomLocatorFlow: boolean;
  // isOpen: boolean;
  // isOnboardingAvailable: boolean;
  // tourSteps: TourProps['steps'];
  // addRef: IAddRefFunction;
  // updateRef: (
  //   name: OnboardingStep,
  //   ref?: MutableRefObject<any>,
  //   onClickNext?: (...args: any) => void,
  //   onClickPrev?: (...args: any) => void,
  // ) => void;
  // openOnboarding: () => void;
  // closeOnboarding: () => void;
  stepsRef: TourStepProps[];
  updateStepRefs: (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    onClick?: (() => void) | undefined,
    onboardingStepsMap?: Map<OnboardingStep, IOnboardingStep>,
  ) => void;
  modifyStepRefByKey: (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    nextButtonProps?: TNextButtonProps,
    prevButtonProps?: TPrevButtonProps,
    onboardingStepsMap?: Map<OnboardingStep, IOnboardingStep>,
  ) => void;
}

export interface StepRef {
  target: MutableRefObject<any>;
  onClickNext?: (...args: any) => void;
  onClickPrev: (...args: any) => void;
}
