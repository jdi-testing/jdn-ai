import { useContext, useLayoutEffect, useRef } from "react";
import { OnboardingContext } from "../OnboardingProvider";
import { OnbrdStep } from "../types/constants";
import { useSelector } from "react-redux";
import { selectFirstLocatorByPO } from "../../pageObjects/pageObject.selectors";

export const useOnBoardingRef = (
  refName: OnbrdStep,
  onClickNext?: (...args: any) => void,
  onClickPrev?: (...args: any) => void,
  isSkipHook?: boolean
) => {
  const ref = useRef<HTMLDivElement>(null);

  const { addRef, isCustomLocatorFlow } = useContext(OnboardingContext);
  const isFirstLocatorChecked = useSelector(selectFirstLocatorByPO)?.generate;

  useLayoutEffect(() => {
    const _ref =
      refName === OnbrdStep.EditLocator && isCustomLocatorFlow && ref.current
        ? { current: ref.current.closest(".ant-modal-content") }
        : ref;
    !isSkipHook && addRef(refName, _ref, onClickNext, onClickPrev);
  }, [ref, isFirstLocatorChecked]);

  return !isSkipHook ? ref : null;
};
