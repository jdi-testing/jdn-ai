import { MutableRefObject } from 'react';
import { OnboardingStep } from './constants';
import { TourProps } from 'antd';

export interface OnboardingContext {
  // a step, that is set to Onboarding based on a state,
  // when user makes action that changes state and onboarding step should be changed
  defaultStep?: number;
  isCustomLocatorFlow: boolean;
  isOpen: boolean;
  isOnboardingAvailable: boolean;
  tourSteps: TourProps['steps'];
  addRef: (
    name: OnboardingStep,
    ref?: MutableRefObject<any>,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void,
  ) => void;
  updateRef: (
    name: OnboardingStep,
    ref?: MutableRefObject<any>,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void,
  ) => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
}

export interface StepRef {
  target: MutableRefObject<any>;
  onClickNext?: (...args: any) => void;
  onClickPrev: (...args: any) => void;
}
