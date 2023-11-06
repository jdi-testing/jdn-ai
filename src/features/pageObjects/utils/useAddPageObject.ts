import { useDispatch } from 'react-redux';
import { addPageObj } from '../reducers/addPageObject.thunk';
import { AppDispatch } from '../../../app/store/store';
import { PageObject } from '../types/pageObjectSlice.types';
import { useOnboarding } from '../../onboarding/useOnboarding';
import { OnboardingStep } from '../../onboarding/constants';

type TSetActivePanel = (pageObjectId: string[] | undefined) => void;

export const useAddPageObject = (setActivePanel: TSetActivePanel, hasDraftPageObject: PageObject | undefined) => {
  const dispatch = useDispatch<AppDispatch>();

  const { handleOnChangeStep, isOnboardingOpen } = useOnboarding();
  // ToDo refactoring DRY
  if (isOnboardingOpen) {
    return async () => {
      if (hasDraftPageObject) {
        setActivePanel([hasDraftPageObject.id.toString()]);
        handleOnChangeStep(OnboardingStep.POsettings);
      } else {
        setActivePanel([]);
        try {
          await dispatch(addPageObj());
          handleOnChangeStep(OnboardingStep.POsettings);
        } catch (error) {
          console.error('Execution error addPageObj:', error);
        }
      }
    };
  }

  return async () => {
    if (hasDraftPageObject) {
      setActivePanel([hasDraftPageObject.id.toString()]);
    } else {
      setActivePanel([]);
      try {
        await dispatch(addPageObj());
      } catch (error) {
        console.error('Execution error addPageObj:', error);
      }
    }
  };
};
