import React, { FC, useEffect } from 'react';
import { Modal, Tour } from 'antd';
import { TourStepProps } from 'antd/lib/tour/interface';
import { StepIndicator } from './components/stepIndicator';
import { OnboardingProviderTexts, OnboardingStep } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store/store';
import { closeModal, openModal, openOnboarding, closeOnboarding, setCurrentStep } from './store/onboarding.slice';
import { LocalStorageKey, getLocalStorage, removeStorage, setLocalStorage } from '../../common/utils/localStorage';
import { BackendStatus, PageType } from '../../app/types/mainSlice.types';
import { selectCurrentStep, selectIsOnboardingOpen, selectIsWelcomeModalOpen } from './store/onboarding.selectors';
import { changePage } from '../../app/main.slice';
import { removePageObject } from '../pageObjects/pageObject.slice';
import { selectCurrentPageObject } from '../pageObjects/selectors/pageObjects.selectors';
import { removeLocators } from '../locators/locators.slice';
import { selectCurrentPage } from '../../app/main.selectors';
import { isPageObjectPage } from '../../app/utils/helpers';
import { removeAll as removeAllFilters } from '../filter/filter.slice';

type TOnboarding = {
  isOpen: boolean;
  steps: TourStepProps[];
  currentStep: number;
  onClose: () => void;
  onChange: (newStep: number) => void;
};

export const Onboarding: FC<TOnboarding> = ({ isOpen, steps, currentStep, onClose, onChange }) => {
  const handleOnChange = (newStep: number) => {
    onChange(newStep);
  };

  return (
    <Tour
      open={isOpen}
      steps={steps}
      current={currentStep}
      onClose={onClose}
      onChange={handleOnChange}
      indicatorsRender={(current, total) => <StepIndicator {...{ current, total }} />}
    />
  );
};

export const useOnboarding = () => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector(selectIsWelcomeModalOpen);
  const isOnboardingOpen = useSelector(selectIsOnboardingOpen);
  const currentStep = useSelector(selectCurrentStep);

  const isOnboardingPassed = getLocalStorage(LocalStorageKey.IsOnboardingPassed);
  const isBackendAvailable = useSelector((state: RootState) => state.main.backendAvailable) === BackendStatus.Accessed;
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);

  const currentPageObject = useSelector(selectCurrentPageObject);
  const currentPage = useSelector(selectCurrentPage);

  const openModalHandler = () => {
    dispatch(openModal());
  };

  const closeModalHandler = () => {
    dispatch(closeModal());
  };

  useEffect(() => {
    if (!isOnboardingPassed && isBackendAvailable && isSessionUnique) {
      openModalHandler();
      setLocalStorage(LocalStorageKey.IsOnboardingPassed, true);
    } else {
      closeModalHandler();
    }
  }, [isBackendAvailable, isSessionUnique]);

  const openOnboardingHandler = () => {
    dispatch(removeAllFilters());
    removeStorage(LocalStorageKey.Filter);

    dispatch(setCurrentStep(0));

    if (!isPageObjectPage(currentPage.page)) {
      if (currentPageObject) {
        // remove current PO and it's locators:
        dispatch(removePageObject(currentPageObject.id));
        dispatch(removeLocators(currentPageObject.locators));
      }
      dispatch(
        changePage({
          page: PageType.PageObject,
          alreadyGenerated: true,
        }),
      );
    }

    dispatch(openOnboarding());
  };

  const closeOnboardingHandler = () => {
    dispatch(closeOnboarding());
    dispatch(setCurrentStep(0));
  };

  const handleConfirmModal = () => {
    closeModalHandler();
    openOnboardingHandler();
  };

  const handleCloseOnboarding = () => {
    closeOnboardingHandler();
  };

  const handleOnChangeStep = (newStep: OnboardingStep) => {
    dispatch(setCurrentStep(newStep));
  };

  const welcomeModal = (
    <Modal
      title={OnboardingProviderTexts.ModalTitle}
      open={isModalOpen}
      onCancel={closeModalHandler}
      onOk={handleConfirmModal}
      okText={OnboardingProviderTexts.ModalOkButtonText}
      cancelText={OnboardingProviderTexts.ModalCancelButtonText}
    >
      {OnboardingProviderTexts.ModalText}
    </Modal>
  );

  return {
    isModalOpen,
    openModal: openModalHandler,
    closeModal: closeModalHandler,
    handleCloseOnboarding,
    handleOnChangeStep,
    handleConfirmModal,
    isOnboardingOpen,
    openOnboarding: openOnboardingHandler,
    currentStep,
    welcomeModal,
  };
};

export default useOnboarding;
