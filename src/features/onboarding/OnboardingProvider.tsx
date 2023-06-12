import React, { FC, MutableRefObject, ReactNode, createContext, useEffect, useState } from "react";
import { OnbrdStep } from "./types/constants";
import { Onboarding } from "./Onboarding";
import { OnboardingContext as ContextType, StepRef } from "./types/context.types";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentPageObject, selectPageObjects } from "../pageObjects/pageObject.selectors";
import { RootState } from "../../app/store/store";
import { IdentificationStatus } from "../locators/types/locator.types";
import { getPOPageSteps } from "./utils/tourSteps";
import { selectCurrentPage, selectIsDefaultState } from "../../app/main.selectors";
import { BackendStatus, PageType } from "../../app/types/mainSlice.types";
import { getLocalStorage, isOnboardingPassed, setLocalStorage } from "../../common/utils/localStorage";
import { Modal } from "antd";
import { removeAll } from "../../app/reducers/removeAll.thunk";

interface Props {
  children: ReactNode;
}

export const OnboardingContext = createContext({ isOpen: false } as ContextType);

export const OnboardingProvider: FC<Props> = ({ children }) => {
  const [stepRefs, setStepRefs] = useState<Record<OnbrdStep, StepRef>>({} as Record<OnbrdStep, StepRef>);
  const [isOnbrdOpen, setIsOnbrdOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const _isOnboardingPassed = getLocalStorage(isOnboardingPassed);
  const isBackendAvailable = useSelector((state: RootState) => state.main.backendAvailable) === BackendStatus.Accessed;
  const isDefaultState = useSelector<RootState>(selectIsDefaultState);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!_isOnboardingPassed && isBackendAvailable) {
      setIsModalOpen(true);
    }
  }, [isBackendAvailable]);

  const openOnboarding = () => {
    if (!isDefaultState) dispatch(removeAll());
    setIsModalOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnbrdOpen(false);
    setStepRefs({} as Record<OnbrdStep, StepRef>);
    setLocalStorage(isOnboardingPassed, true);
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

  const handleConfirmModal = () => {
    setIsModalOpen(false);
    setIsOnbrdOpen(true);
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
    <OnboardingContext.Provider
      value={{ defaultStep, isOpen: isOnbrdOpen, tourSteps, addRef, openOnboarding, closeOnboarding }}
    >
      {children}
      <Onboarding />
      <Modal
        title="Welcome to Onboarding Tutorial!"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleConfirmModal}
      >
        Discover all the features and possibilities of the extension with the onboarding tutorial.
      </Modal>
    </OnboardingContext.Provider>
  );
};
