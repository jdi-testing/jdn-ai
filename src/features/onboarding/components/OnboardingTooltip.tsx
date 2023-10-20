import React, { FC, useContext } from 'react';
import { OnboardingContext } from '../OnboardingProvider';
import { Tooltip } from 'antd';

interface Props {
  children: React.ReactNode;
}

export const OnboardingTooltip: FC<Props> = ({ children }) => {
  const { isOpen: isOnboardingOpen } = useContext(OnboardingContext);

  return (
    <React.Fragment>
      {isOnboardingOpen ? (
        <Tooltip title="Available only after completing the onboarding">{children}</Tooltip>
      ) : (
        children
      )}
    </React.Fragment>
  );
};
