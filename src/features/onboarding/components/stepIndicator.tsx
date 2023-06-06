import React, { FC } from "react";
import { addLocatorsSteps, createPOSteps, finishSteps } from "../utils/tourSteps";
import { OnbrdStep } from "../types/constants";
import { StepRef } from "../types/context.types";

interface Props {
  current: number;
  total: number;
}

export const StepIndicator: FC<Props> = ({ current }) => {
  const createPOlength = createPOSteps({} as Record<OnbrdStep, StepRef>).length;
  const locatorsLength = addLocatorsSteps({} as Record<OnbrdStep, StepRef>).length;
  const finishLength = finishSteps({} as Record<OnbrdStep, StepRef>).length;

  let currentStep, totalSteps;

  if (current < createPOlength) {
    currentStep = current + 1;
    totalSteps = createPOlength;
  } else if (current < createPOlength + locatorsLength) {
    currentStep = current - createPOlength + 1;
    totalSteps = locatorsLength;
  } else {
    currentStep = current - createPOlength - locatorsLength + 1;
    totalSteps = finishLength;
  }

  return (
    <span>
      {currentStep} / {totalSteps}
    </span>
  );
};
