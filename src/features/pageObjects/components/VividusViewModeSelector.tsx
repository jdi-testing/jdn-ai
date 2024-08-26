import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Radio, RadioChangeEvent, Typography } from 'antd';
import { selectViewMode } from '../../locators/selectors/vivdusView.selectors';
import { setViewMode, ViewMode } from '../../locators/VividusView.slice';

const ViewModeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const viewMode = useSelector(selectViewMode);

  const handleViewModeChange = (e: RadioChangeEvent) => {
    const newMode = e.target.value as ViewMode;
    if (newMode !== viewMode) {
      dispatch(setViewMode(newMode));
    }
  };

  return (
    <>
      <Typography.Text>View Mode:</Typography.Text>
      <Radio.Group
        onChange={handleViewModeChange}
        value={viewMode}
        className="jdn__pageObject__settings_view-mode-selector"
      >
        <Radio.Button value={ViewMode.Table}>Table</Radio.Button>
        <Radio.Button value={ViewMode.List}>Variables</Radio.Button>
      </Radio.Group>
    </>
  );
};

export default ViewModeSelector;
