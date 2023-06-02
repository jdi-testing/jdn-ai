import React, { FC, MutableRefObject, ReactNode, createContext, useState } from "react";
import { OnbrdControl } from "./types/constants";
import { Onboarding } from "./Onboarding";
import { OnboardingContext as ContextType } from "./types/context.types";
import { useSelector } from "react-redux";
import { selectPageObjects } from "../pageObjects/pageObject.selectors";
import { RootState } from "../../app/store/store";
import { IdentificationStatus } from "../locators/types/locator.types";

interface Props {
  children: ReactNode;
}

export const OnboardingContext = createContext({ isOpen: false } as ContextType);

export const OnboardingProvider: FC<Props> = ({ children }) => {
  const [stepRefs, setStepRefs] = useState<ContextType["stepRefs"]>({} as ContextType["stepRefs"]);
  const [isOpen, setIsOpen] = useState(false);

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
  const isNewPageObject = useSelector(selectPageObjects).length > 0;
  const generationStarted =
    useSelector((state: RootState) => state.locators.present.status) === IdentificationStatus.loading;
  const defaultStep = generationStarted ? 3 : isNewPageObject ? 1 : 0;

  return (
    <OnboardingContext.Provider value={{ defaultStep, isOpen, stepRefs, addRef, openOnboarding, closeOnboarding }}>
      {children}
      <Onboarding />
    </OnboardingContext.Provider>
  );
};
