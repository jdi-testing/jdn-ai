import { MutableRefObject } from "react";
import { OnbrdStep } from "./constants";
import { TourProps } from "antd5";

export interface OnboardingContext {
  defaultStep?: number;
  isOpen: boolean;
  tourSteps: TourProps["steps"];
  addRef: (
    name: OnbrdStep,
    ref: MutableRefObject<any>,
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
