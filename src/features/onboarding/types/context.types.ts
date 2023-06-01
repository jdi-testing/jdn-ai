import { MutableRefObject } from "react";
import { OnbrdControl } from "./constants";

export interface OnboardingContext {
  currentStep: number;
  isOpen: boolean;
  stepRefs: Record<OnbrdControl, StepRef>;
  addRef: (name: OnbrdControl, ref: MutableRefObject<any>, onClickNext?: (...args: any) => void) => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
}

export interface StepRef {
  target: MutableRefObject<any>;
  onClickNext?: (...args: any) => void;
}
