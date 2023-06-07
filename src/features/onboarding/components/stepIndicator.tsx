import React, { FC } from "react";

interface Props {
  current: number;
  total: number;
}

export const StepIndicator: FC<Props> = ({ current, total }) => {
  return (
    <span>
      {current + 1} / {total}
    </span>
  );
};
