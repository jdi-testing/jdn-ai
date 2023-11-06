import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';

const selectOnboardingState = (state: RootState) => state.onboarding;

export const selectIsCustomLocatorFlow = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.isCustomLocatorFlow,
);

export const selectIsOnboardingOpen = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.isOnboardingOpen,
);

export const selectIsWelcomeModalOpen = createSelector(
  [selectOnboardingState],
  (onboarding) => onboarding.isWelcomeModalOpen,
);

export const selectCurrentStep = createSelector([selectOnboardingState], (onboarding) => onboarding.currentStep);
