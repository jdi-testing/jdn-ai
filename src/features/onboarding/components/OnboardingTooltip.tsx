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
        <Tooltip placement="top" title="Available only after completing the onboarding">
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </>
  );
};
