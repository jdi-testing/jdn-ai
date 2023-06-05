import { useContext, useLayoutEffect, useRef } from "react";
import { OnboardingContext } from "../OnboardingProvider";
import { OnbrdStepName } from "../types/constants";

export const useOnBoardingRef = (refName: OnbrdStepName, onClickNext?: (...args: any) => void) => {
  const ref = useRef(null);

  const { addRef } = useContext(OnboardingContext);

  useLayoutEffect(() => {
    addRef(refName, ref, onClickNext);
  }, [ref]);

  return ref;
};
