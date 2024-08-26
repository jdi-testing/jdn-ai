import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

import 'react-resizable/css/styles.css';
import '../../../common/styles/ResizableColumns.less';
import { ExpandState, LocatorsTree } from './LocatorsTree';
import { ElementId } from '../types/locator.types';

export interface ResizableContainerProps {
  locatorIds: ElementId[];
  expandAll: string[];
  setExpandAll: (val: ExpandState) => void;
  searchString: string;
}

const ResizableColumnContainer: React.FC<ResizableContainerProps> = ({
  locatorIds,
  expandAll,
  setExpandAll,
  searchString,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);

  const syncScrollPosition = (sourceColumn: 'left' | 'right', scrollPosition: number) => {
    const targetRef = sourceColumn === 'left' ? rightRef.current : leftRef.current;
    if (targetRef) {
      const targetScrollContainer = targetRef.querySelector('.ant-tree-list-holder');
      if (targetScrollContainer) {
        targetScrollContainer.scrollTop = scrollPosition;
      }
    }
  };

  const createHandleScroll = (column: 'left' | 'right') => (scrollPosition: number) => {
    syncScrollPosition(column, scrollPosition);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        setLeftWidth(Math.max(100, newWidth * 0.3));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleResize = useCallback((e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => {
    const newLeftWidth = data.size.width;
    setLeftWidth(newLeftWidth);
  }, []);

  return (
    <div ref={containerRef} className="jdn__locatorsTree-container--table">
      {containerRef.current && (
        <Resizable
          width={leftWidth ?? 100}
          axis="x"
          handle={<span className="resizable-handle" />}
          onResize={handleResize}
        >
          <div className="jdn__locatorsTree--left" style={{ width: leftWidth }} ref={leftRef}>
            <LocatorsTree
              locatorIds={locatorIds}
              expandAll={expandAll}
              setExpandAll={setExpandAll}
              searchString={searchString}
              onScroll={createHandleScroll('left')}
            />
          </div>
        </Resizable>
      )}

      <div className="jdn__locatorsTree--right" ref={rightRef}>
        <LocatorsTree
          locatorIds={locatorIds}
          expandAll={expandAll}
          setExpandAll={setExpandAll}
          searchString={searchString}
          onScroll={createHandleScroll('right')}
        />
      </div>
    </div>
  );
};

export default ResizableColumnContainer;
