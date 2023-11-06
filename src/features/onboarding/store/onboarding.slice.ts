// for PayloadAction
// eslint-disable-next-line import/named
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { OnboardingStep } from '../constants';

interface IOnboardingState {
  isWelcomeModalOpen: boolean;
  isOnboardingOpen: boolean;
  currentStep: number;
  isCustomLocatorFlow: boolean;
}

const initialState: IOnboardingState = {
  isWelcomeModalOpen: false,
  isOnboardingOpen: false,
  currentStep: 0,
  isCustomLocatorFlow: false,
};

const modalReducers = {
  openModal: (state: IOnboardingState) => {
    state.isWelcomeModalOpen = true;
  },
  closeModal: (state: IOnboardingState) => {
    state.isWelcomeModalOpen = false;
  },
};

const onboardingReducers = {
  openOnboarding: (state: IOnboardingState) => {
    state.isOnboardingOpen = true;
  },
  closeOnboarding: (state: IOnboardingState) => {
    state.isOnboardingOpen = false;

    state.currentStep = 0;
    state.isCustomLocatorFlow = false;
  },
  setCurrentStep: (state: IOnboardingState, action: PayloadAction<OnboardingStep>) => {
    state.currentStep = action.payload;
  },
  setIsCustomLocatorFlow: (state: IOnboardingState, action: PayloadAction<boolean>) => {
    state.isCustomLocatorFlow = action.payload;
  },
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    ...modalReducers,
    ...onboardingReducers,
  },
});

export const { openModal, closeModal, openOnboarding, closeOnboarding, setCurrentStep, setIsCustomLocatorFlow } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
