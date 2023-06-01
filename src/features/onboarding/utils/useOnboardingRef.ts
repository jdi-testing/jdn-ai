import { useContext, useLayoutEffect, useRef } from "react";
import { OnboardingContext } from "../OnboardingProvider";
import { OnbrdControl } from "../types/constants";

export const useOnBoardingRef = (refName: OnbrdControl, onClickNext?: (...args: any) => void) => {
  const ref = useRef(null);

  const { addRef } = useContext(OnboardingContext);

  useLayoutEffect(() => {
    addRef(refName, ref, onClickNext);
  }, [ref]);

  return ref;
};
