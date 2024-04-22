import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { selectIsOnboardingOpen } from '../store/onboarding.selectors';

interface Props {
  children: React.ReactNode;
}

export const OnboardingTooltip: FC<Props> = ({ children }) => {
  const isOnboardingOpen = useSelector(selectIsOnboardingOpen);
  return (
    <>
      {isOnboardingOpen ? (
        <Tooltip title="Available only after completing the onboarding" align={{ offset: [0, -20] }}>
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </>
  );
};
