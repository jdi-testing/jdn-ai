import React from 'react';
import { ExpandState, LocatorsTree } from './LocatorsTreeNew';
import { ElementId } from '../types/locator.types';
import ResizableColumnContainer from './ResizableColumnContainer';

interface LocatorsTreeColumnComponentProps {
  locatorIds: ElementId[];
  viewProps: {
    expandAll: ExpandState;
    setExpandAll: (val: ExpandState) => void;
    searchString: string;
  };
}

export const LocatorsTreeColumnView: React.FC<LocatorsTreeColumnComponentProps> = ({ locatorIds, viewProps }) => {
  return (
    <ResizableColumnContainer>
      <LocatorsTree locatorIds={locatorIds} viewProps={viewProps} />
    </ResizableColumnContainer>
  );
};
