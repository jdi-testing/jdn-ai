import { useContext, useLayoutEffect, useRef } from 'react';
import { OnboardingContext } from '../OnboardingProvider';
import { OnbrdStep } from '../types/constants';
import { useSelector } from 'react-redux';
import { selectFirstLocatorByPO } from '../../locators/selectors/locatorsByPO.selectors';

const locatorPageSteps = [OnbrdStep.CustomLocator, OnbrdStep.EditLocator, OnbrdStep.AddToPO, OnbrdStep.SaveLocators];

export const useOnBoardingRef = (
  refName: OnbrdStep,
  onClickNext?: (...args: any) => void,
  onClickPrev?: (...args: any) => void,
  isSkipHook?: boolean,
) => {
  const ref = useRef<HTMLDivElement>(null);

  const { addRef, isCustomLocatorFlow, isOpen } = useContext(OnboardingContext);
  const isFirstLocatorChecked = useSelector(selectFirstLocatorByPO)?.isGenerated;
  /* if onboarding is closed, no need to save these refs */
  const isRedundantStep = !isOpen && locatorPageSteps.includes(refName);

  useLayoutEffect(() => {
    const _ref =
      refName === OnbrdStep.EditLocator && isCustomLocatorFlow && ref.current
        ? { current: ref.current.closest('.ant-modal-content') }
        : ref;
    !isSkipHook && !isRedundantStep && addRef(refName, _ref, onClickNext, onClickPrev);
  }, [ref, isFirstLocatorChecked]);

  return !isSkipHook && !isRedundantStep ? ref : null;
};
