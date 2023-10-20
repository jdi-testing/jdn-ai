import React, { FC, MutableRefObject, ReactNode, createContext, useEffect, useState } from 'react';
import { OnboardingStep, OnboardingProviderTexts } from './types/constants';
import { Onboarding } from './Onboarding';
import { OnboardingContext as ContextType, StepRef } from './types/context.types';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPageObject, selectPageObjects } from '../pageObjects/selectors/pageObjects.selectors';
import { AppDispatch, RootState } from '../../app/store/store';
import { IdentificationStatus } from '../locators/types/locator.types';
import { getPOPageSteps } from './utils/tourSteps';
import { selectCurrentPage, selectIsDefaultState } from '../../app/main.selectors';
import { BackendStatus, PageType } from '../../app/types/mainSlice.types';
import { LocalStorageKey, getLocalStorage, setLocalStorage } from '../../common/utils/localStorage';
import { Modal } from 'antd';
import { removeAll } from '../../app/reducers/removeAll.thunk';

interface Props {
  children: ReactNode;
}

export const OnboardingContext = createContext({ isOpen: false } as ContextType);

export const OnboardingProvider: FC<Props> = ({ children }) => {
  const [stepRefs, setStepRefs] = useState<Record<OnboardingStep, StepRef>>({} as Record<OnboardingStep, StepRef>);
  const [isOnbrdOpen, setIsOnbrdOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomLocatorFlow, setIsCustomLocatorFlow] = useState(false);

  const _isOnboardingPassed = getLocalStorage(LocalStorageKey.IsOnboardingPassed);
  const isBackendAvailable = useSelector((state: RootState) => state.main.backendAvailable) === BackendStatus.Accessed;
  const isDefaultState: boolean = useSelector<RootState>(selectIsDefaultState) as boolean;
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);
  const isOnboardingAvailable = isBackendAvailable && !isOnbrdOpen;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!_isOnboardingPassed && isBackendAvailable && isSessionUnique) {
      setIsModalOpen(true);
      setLocalStorage(LocalStorageKey.IsOnboardingPassed, true);
    } else {
      setIsModalOpen(false);
    }
  }, [isBackendAvailable, isSessionUnique]);

  const openOnboarding = () => {
    if (!isDefaultState) dispatch(removeAll());
    setIsModalOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnbrdOpen(false);
  };
  const addRef = (
    name: OnboardingStep,
    ref?: MutableRefObject<any>,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void,
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

  const updateRef = (
    name: OnboardingStep,
    ref?: MutableRefObject<any>,
    onClickNext?: (...args: any) => void,
    onClickPrev?: (...args: any) => void,
  ) => {
    setStepRefs((prevRefs) => {
      /* case for skipped step, see `locatorPageSteps` at useOnBoardingRef.ts */
      if (!prevRefs[name]) return prevRefs;

      const { target: currentTarget, onClickNext: currentNext, onClickPrev: currentPrev } = prevRefs[name];
      return {
        ...prevRefs,
        [name]: {
          target: ref || currentTarget,
          onClickNext: onClickNext || currentNext,
          onClickPrev: onClickPrev || currentPrev,
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
  const poHasLocators = !!useSelector(selectCurrentPageObject)?.locators?.length;
  const locatorsGenerated = useSelector(
    (state: RootState) =>
      state.locators.present.status === IdentificationStatus.noStatus ||
      state.locators.present.status === IdentificationStatus.noElements,
  );

  // for a case when by any user's actions state is changed
  // and Onboarding step should be changed programmatically
  const defaultStep =
    isPoPage && poHasLocators
      ? OnboardingStep.DownloadPO
      : !isPoPage && isCustomLocatorFlow && poHasLocators
      ? OnboardingStep.AddToPO
      : !isPoPage && isCustomLocatorFlow && stepRefs[OnboardingStep.EditLocator]?.target?.current
      ? OnboardingStep.EditLocator
      : !isPoPage
      ? OnboardingStep.CustomLocator
      : isIdentificationInProgress
      ? OnboardingStep.Generating
      : isNewPageObject
      ? OnboardingStep.POsettings
      : OnboardingStep.NewPageObject;

  const tourSteps = getPOPageSteps(stepRefs, isCustomLocatorFlow);

  if (defaultStep === OnboardingStep.CustomLocator && locatorsGenerated && !poHasLocators && !isCustomLocatorFlow) {
    setIsCustomLocatorFlow(true);
  }

  return (
    <OnboardingContext.Provider
      value={{
        defaultStep,
        isOpen: isOnbrdOpen,
        isOnboardingAvailable,
        tourSteps,
        isCustomLocatorFlow,
        addRef,
        updateRef,
        openOnboarding,
        closeOnboarding,
      }}
    >
      {children}
      <Onboarding />
      <Modal
        title={OnboardingProviderTexts.ModalTitle}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleConfirmModal}
        okText={OnboardingProviderTexts.ModalOkButtonText}
        cancelText={OnboardingProviderTexts.ModalCancelButtonText}
      >
        {OnboardingProviderTexts.ModalText}
      </Modal>
    </OnboardingContext.Provider>
  );
};
