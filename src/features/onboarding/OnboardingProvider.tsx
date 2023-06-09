import React, { FC, MutableRefObject, ReactNode, createContext, useState } from "react";
import { OnbrdStep } from "./types/constants";
import { Onboarding } from "./Onboarding";
import { OnboardingContext as ContextType, StepRef } from "./types/context.types";
import { useSelector } from "react-redux";
import { selectCurrentPageObject, selectPageObjects } from "../pageObjects/pageObject.selectors";
import { RootState } from "../../app/store/store";
import { IdentificationStatus } from "../locators/types/locator.types";
import { getPOPageSteps } from "./utils/tourSteps";
import { selectCurrentPage } from "../../app/main.selectors";
import { PageType } from "../../app/types/mainSlice.types";

interface Props {
  children: ReactNode;
}

export const OnboardingContext = createContext({ isOpen: false } as ContextType);

export const OnboardingProvider: FC<Props> = ({ children }) => {
  const [stepRefs, setStepRefs] = useState<Record<OnbrdStep, StepRef>>({} as Record<OnbrdStep, StepRef>);
  const [isOpen, setIsOpen] = useState(false);

  const openOnboarding = () => setIsOpen(true);
  const closeOnboarding = () => {
    setIsOpen(false);
    setStepRefs({} as Record<OnbrdStep, StepRef>);
  };
  const addRef = (
    name: OnbrdStep,
    ref: MutableRefObject<any>,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void
  ) => {
    setStepRefs((prevRefs) => {
      return {
        ...prevRefs,
        [name]: {
          target: ref,
          onClickNext,
          onClickPrev,
        },
      };
    });
  };

  // selectors for step change
  const isNewPageObject = useSelector(selectPageObjects).length > 0;
  const isIdentificationInProgress =
    useSelector((state: RootState) => state.locators.present.status) === IdentificationStatus.loading;
  const isPoPage = useSelector(selectCurrentPage).page === PageType.PageObject;
  const poHasLocators = useSelector(selectCurrentPageObject)?.locators;

  const defaultStep =
    isPoPage && poHasLocators
      ? OnbrdStep.DownloadPO
      : !isPoPage
      ? OnbrdStep.CustomLocator
      : isIdentificationInProgress
      ? OnbrdStep.Generating
      : isNewPageObject
      ? OnbrdStep.POsettings
      : OnbrdStep.NewPageObject;

  const tourSteps = getPOPageSteps(stepRefs);

  // console.log("isOpen", isOpen);
  // console.log("defaultStep", defaultStep);
  // console.log("tourSteps", tourSteps);

  return (
    <OnboardingContext.Provider value={{ defaultStep, isOpen, tourSteps, addRef, openOnboarding, closeOnboarding }}>
      {children}
      <Onboarding />
    </OnboardingContext.Provider>
  );
};
