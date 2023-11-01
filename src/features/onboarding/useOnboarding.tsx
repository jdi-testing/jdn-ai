/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { Modal, Tour } from 'antd';
import { TourProps, TourStepProps } from 'antd/lib/tour/interface';
import { StepIndicator } from './components/stepIndicator';
import {
  IOnboardingStep,
  IOnboardingSteps,
  OnboardingProviderTexts,
  OnboardingStep,
  onboardingMap,
  onboardingSteps,
} from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store/store';
// eslint-disable-next-line import/namespace
import { closeModal, openModal, openOnboarding, closeOnboarding } from './onboarding.slice';
// import { selectOnboarding } from './onboarding.selectors';

export const Onboarding: React.FC<{
  isOpen: boolean;
  steps: TourStepProps[];
  currentStep: number;
  onClose: () => void;
  onChange: (newStep: number) => void;
}> = ({ isOpen, steps, currentStep, onClose, onChange }) => {
  // console.log('is ***Onboarding*** Open: ', isOpen, currentStep);
  // console.log(steps);

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
      // update={currentStep}
      // disableFocusLock
      // showButtons={true}
      // showNavigation={true}
      // accentColor="#007bff"
      // onAfterOpen={() => {
      //   // Действия после открытия onboarding
      // }}
    />
  );
};

export const useOnboarding = () => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector((state: RootState) => state.onboarding.isWelcomeModalOpen);
  const isOnboardingOpen = useSelector((state: RootState) => state.onboarding.isOnboardingOpen);
  const [currentStep, setCurrentStep] = useState<number>(0);
  // const [steps, setSteps] = useState<TourStepProps[]>(convertOnboardingStepsToTourSteps(onboardingMap));

  const openModalHandler = () => {
    dispatch(openModal());
  };

  const closeModalHandler = () => {
    dispatch(closeModal());
  };

  const openOnboardingHandler = () => {
    dispatch(openOnboarding());
  };

  const closeOnboardingHandler = () => {
    dispatch(closeOnboarding());
    setCurrentStep(0);
  };

  // move to utils
  // const convertOnboardingStepsToTourSteps = (
  //   onboardingStepsMap: Map<OnboardingStep, IOnboardingStep>,
  // ): TourStepProps[] => {
  //   const steps: TourStepProps[] = [];
  //   onboardingStepsMap.forEach((stepData) => {
  //     steps.push({
  //       // order: stepData.order,
  //       title: stepData.title,
  //       description: stepData.description,
  //       target: stepData.target?.current,
  //       nextButtonProps: stepData.nextButtonProps,
  //     });
  //   });
  //   return steps;
  // };

  // const updateStepRefs = (
  //   key: OnboardingStep,
  //   stepRef: React.RefObject<HTMLElement> | null,
  //   onClick?: (() => void) | undefined,
  //   onboardingStepsMap: Map<OnboardingStep, IOnboardingStep> = onboardingMap,
  // ): TourStepProps[] => {
  //   const updatedSteps: TourStepProps[] = Array.from(onboardingStepsMap.values()).map((stepData) => {
  //     if (key === stepData.order) {
  //       if (stepData.nextButtonProps) {
  //         stepData.target = stepRef;
  //         stepData.nextButtonProps.onClick = onClick;
  //       }
  //     }
  //     return {
  //       title: stepData.title,
  //       description: stepData.description,
  //       target: stepData.target?.current,
  //       nextButtonProps: stepData.nextButtonProps,
  //     };
  //   });
  //   console.log('updateStepRefs: ', key, updatedSteps);

  //   // setSteps(updatedSteps);
  //   // обновлять steps из Context
  //   return updatedSteps;
  // };

  // const steps: TourProps['steps'] = convertOnboardingStepsToTourSteps(onboardingMap);
  // console.log(steps);

  const handleConfirmModal = () => {
    closeModalHandler();
    openOnboardingHandler();
  };

  const handleCloseOnboarding = () => {
    closeOnboardingHandler();
  };

  const handleOnChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  // const onboarding = (
  //   <Onboarding
  //     isOpen={isOnboardingOpen}
  //     steps={steps}
  //     currentStep={currentStep}
  //     onClose={handleCloseOnboarding}
  //     onChange={handleOnChange}
  //   />
  // );

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

  // console.log(isModalOpen);

  return {
    isModalOpen,
    openModal: openModalHandler,
    closeModal: closeModalHandler,
    handleCloseOnboarding,
    handleOnChange,
    handleConfirmModal,
    isOnboardingOpen,
    openOnboarding: openOnboardingHandler,
    closeOnboarding: closeOnboardingHandler,
    // onboarding,
    // steps,
    currentStep,
    // setSteps,
    welcomeModal,
    // updateStepRefs,
  };
};

export default useOnboarding;
