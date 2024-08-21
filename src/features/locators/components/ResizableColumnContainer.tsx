import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

import 'react-resizable/css/styles.css';
import '../../../common/styles/ResizableColumns.less';

export interface ResizableContainerProps {
  children: React.ReactNode;
}

const ResizableColumnContainer: React.FC<ResizableContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);

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
  // console.log('---------------> 2');
  return (
    <div ref={containerRef} className="jdn__locatorsTree-container--table">
      {containerRef.current && (
        <Resizable
          width={leftWidth ?? 100}
          axis="x"
          handle={<span className="resizable-handle" />}
          onResize={handleResize}
        >
          <div className="jdn__locatorsTree-left" style={{ width: leftWidth }}>
            {children}
          </div>
        </Resizable>
      )}

      <div className="jdn__locatorsTree-right">{children}</div>
    </div>
  );
};

export default ResizableColumnContainer;
