import React, { FC, useEffect } from 'react';
import { Modal, Tour } from 'antd';
import { TourStepProps } from 'antd/lib/tour/interface';
import { StepIndicator } from './components/stepIndicator';
import { OnboardingProviderTexts, OnboardingStep } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store/store';
import { closeModal, openModal, openOnboarding, closeOnboarding, setCurrentStep } from './store/onboarding.slice';
import { LocalStorageKey, getLocalStorage, setLocalStorage } from '../../common/utils/localStorage';
import { BackendStatus } from '../../app/types/mainSlice.types';
import { selectCurrentStep, selectIsOnboardingOpen, selectIsWelcomeModalOpen } from './store/onboarding.selectors';

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
    closeOnboarding: closeOnboardingHandler,
    currentStep,
    welcomeModal,
  };
};

export default useOnboarding;
