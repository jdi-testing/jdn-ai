import React, { FC, MutableRefObject, ReactNode, createContext, useState } from "react";
import { OnbrdControl } from "./types/constants";
import { Onboarding } from "./Onboarding";
import { OnboardingContext as ContextType } from "./types/context.types";
import { useSelector } from "react-redux";
import { selectPageObjects } from "../pageObjects/pageObject.selectors";

interface Props {
  children: ReactNode;
}

export const OnboardingContext = createContext({ isOpen: false } as ContextType);

export const OnboardingProvider: FC<Props> = ({ children }) => {
  const [stepRefs, setStepRefs] = useState<ContextType["stepRefs"]>({} as ContextType["stepRefs"]);
  const [isOpen, setIsOpen] = useState(false);
  // const [currentStep, setCurrentStep] = useState(0);
  const [currentStep] = useState(0);

  const openOnboarding = () => setIsOpen(true);
  const closeOnboarding = () => setIsOpen(false);
  const addRef = (name: OnbrdControl, ref: MutableRefObject<any>, onClickNext?: (...args: any) => void) => {
    setStepRefs((prevRefs) => {
      return {
        ...prevRefs,
        [name]: {
          target: ref,
          onClickNext,
        },
      };
    });
  };

  // selectors for step change
  const pageObjectCreated = useSelector(selectPageObjects).length > 0;

  return (
    <OnboardingContext.Provider value={{ currentStep, isOpen, stepRefs, addRef, openOnboarding, closeOnboarding }}>
      {children}
      <Onboarding />
    </OnboardingContext.Provider>
  );
};
