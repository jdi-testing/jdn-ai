import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import '../../../common/styles/ResizableColumns.less';
import { Locator } from '../../locators/Locator';

import { PageType } from '../../../app/types/mainSlice.types';
import { ILocator } from '../../locators/types/locator.types';
import { getTaskStatus } from '../../locators/utils/utils';

interface ResizableContainerProps {
  elements: ILocator[];
}

const LocatorsColumnViewForPO: React.FC<ResizableContainerProps> = ({ elements }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);

  const syncScrollPosition = (sourceColumn: 'left' | 'right') => {
    const sourceRef = sourceColumn === 'left' ? leftRef.current : rightRef.current;
    const targetRef = sourceColumn === 'left' ? rightRef.current : leftRef.current;

    if (sourceRef && targetRef) {
      targetRef.scrollTop = sourceRef.scrollTop;
    }
  };

  const handleLeftScroll = () => {
    syncScrollPosition('left');
  };

  const handleRightScroll = () => {
    syncScrollPosition('right');
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
    <div ref={containerRef} className="jdn__locators-container--table">
      {containerRef.current && (
        <Resizable
          width={leftWidth ?? 100}
          axis="x"
          handle={<span className="resizable-handle" />}
          onResize={handleResize}
        >
          <div
            className="jdn__locators--left"
            style={{ width: leftWidth, overflowY: 'auto' }}
            ref={leftRef}
            onScroll={handleLeftScroll}
          >
            {elements.map((element) => {
              const locatorTaskStatus = getTaskStatus(
                element.locatorValue.xPathStatus,
                element.locatorValue.cssSelectorStatus,
              );
              const elementWithTaskStatus = { ...element, locatorTaskStatus };

              return (
                <Locator key={element.elementId} element={elementWithTaskStatus} currentPage={PageType.PageObject} />
              );
            })}
          </div>
        </Resizable>
      )}

      <div className="jdn__locators--right" ref={rightRef} style={{ overflowY: 'auto' }} onScroll={handleRightScroll}>
        {elements.map((element) => {
          const locatorTaskStatus = getTaskStatus(
            element.locatorValue.xPathStatus,
            element.locatorValue.cssSelectorStatus,
          );
          const elementWithTaskStatus = { ...element, locatorTaskStatus };

          return <Locator key={element.elementId} element={elementWithTaskStatus} currentPage={PageType.PageObject} />;
        })}
      </div>
    </div>
  );
};

export default LocatorsColumnViewForPO;
