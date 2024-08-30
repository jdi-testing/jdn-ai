import React, { useMemo } from 'react';
import { ExpandState } from './LocatorsTree';
import { ElementId } from '../types/locator.types';
import ResizableColumnContainer from './ResizableColumnContainer';

interface LocatorsTreeColumnComponentProps {
  locatorIds: ElementId[];
  expandAll: string[];
  setExpandAll: (val: ExpandState) => void;
  searchString: string;
}

export const LocatorsTreeColumnView: React.FC<LocatorsTreeColumnComponentProps> = ({
  locatorIds,
  expandAll,
  setExpandAll,
  searchString,
}) => {
  const memoizedLocatorIds = useMemo(() => locatorIds, [locatorIds]);
  const memoizedExpandAll = useMemo(() => expandAll, [expandAll]);
  const memoizedSetExpandAll = useMemo(() => setExpandAll, [setExpandAll]);
  const memoizedSearchString = useMemo(() => searchString, [searchString]);

  return (
    <ResizableColumnContainer
      locatorIds={memoizedLocatorIds}
      expandAll={memoizedExpandAll}
      setExpandAll={memoizedSetExpandAll}
      searchString={memoizedSearchString}
    />
  );
};
