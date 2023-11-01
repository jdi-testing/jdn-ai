import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { RootState } from '../../../app/store/store';
import { useSelector } from 'react-redux';

interface Props {
  children: React.ReactNode;
}

export const OnboardingTooltip: FC<Props> = ({ children }) => {
  const isOnboardingOpen = useSelector((state: RootState) => state.onboarding.isOnboardingOpen);
  return (
    <>
      {isOnboardingOpen ? (
        <Tooltip title="Available only after completing the onboarding">{children}</Tooltip>
      ) : (
        children
      )}
    </>
  );
};
