// import { useLayoutEffect, useRef } from 'react';
// import { OnboardingStep } from '../constants';
// import { useSelector } from 'react-redux';
// import { selectFirstLocatorByPO } from '../../locators/selectors/locatorsByPO.selectors';

// const locatorPageSteps = [
//   OnboardingStep.CustomLocator,
//   OnboardingStep.EditLocator,
//   OnboardingStep.AddToPO,
//   OnboardingStep.SaveLocators,
// ];

// export const useOnBoardingRef = (
//   refName: OnboardingStep,
//   onClickNext?: (...args: any) => void,
//   onClickPrev?: (...args: any) => void,
//   isSkipHook?: boolean,
// ) => {
//   const ref = useRef<HTMLDivElement>(null);

//   const { addRef, isOpen } = useContext(OnboardingContext);
//   const isFirstLocatorChecked = useSelector(selectFirstLocatorByPO)?.isGenerated;
//   /* if onboarding is closed, no need to save these refs */
//   const isRedundantStep = !isOpen && locatorPageSteps.includes(refName);

//   useLayoutEffect(() => {
//     const _ref =
//       refName === OnboardingStep.EditLocator && isCustomLocatorFlow && ref.current
//         ? { current: ref.current.closest('.ant-modal-content') }
//         : ref;
//     !isSkipHook && !isRedundantStep && addRef(refName, _ref, onClickNext, onClickPrev);
//   }, [ref, isFirstLocatorChecked]);

//   return !isSkipHook && !isRedundantStep ? ref : null;
// };
