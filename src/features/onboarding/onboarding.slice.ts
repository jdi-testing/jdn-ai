import { createSlice } from '@reduxjs/toolkit';

interface IOnboardingState {
  isWelcomeModalOpen: boolean;
  isOnboardingOpen: boolean;
}

const initialState: IOnboardingState = {
  isWelcomeModalOpen: false,
  isOnboardingOpen: false,
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

export const { openModal, closeModal, openOnboarding, closeOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
