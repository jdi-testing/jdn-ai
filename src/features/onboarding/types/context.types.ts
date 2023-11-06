import { MutableRefObject } from 'react';
import { IOnboardingStep, OnboardingStep, TNextButtonProps, TPrevButtonProps } from '../constants';
import { TourStepProps } from 'antd/lib/tour/interface';

export interface IOnboardingContext {
  stepsRef: TourStepProps[];
  updateStepRefs: (
    key: OnboardingStep,
    stepRef: React.RefObject<HTMLElement> | null,
    onClickNext?: (() => void) | undefined,
    onClickPrev?: (() => void) | undefined,
    onboardingStepsMap?: Map<OnboardingStep, IOnboardingStep>,
  ) => void;
  modifyStepRefByKey: (
    key: OnboardingStep,
    stepRef?: React.RefObject<HTMLElement> | null,
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
