import { Spin } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store/store';

export const LocatorTreeSpinner = () => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  return (
    <div className="jdn__locatorTree_spinner">
      <Spin tip={status} size="large" />
    </div>
  );
};
