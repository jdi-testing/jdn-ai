import { useContext, useLayoutEffect, useRef } from "react";
import { OnboardingContext } from "../OnboardingProvider";
import { OnbrdStep } from "../types/constants";

export const useOnBoardingRef = (refName: OnbrdStep, onClickNext?: (...args: any) => void, onClickPrev?: (...args: any) => void) => {
  const ref = useRef(null);

  const { addRef } = useContext(OnboardingContext);

  useLayoutEffect(() => {
    addRef(refName, ref, onClickNext, onClickPrev);
  }, [ref]);

  return ref;
};
