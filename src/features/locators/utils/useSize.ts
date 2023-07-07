import React from "react";
import useResizeObserver from "@react-hook/resize-observer";

export const useSize = (target: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = React.useState<DOMRect>();

  React.useLayoutEffect(() => {
    target.current && setSize(target.current.getBoundingClientRect());
  }, [target.current]);

  useResizeObserver(target.current, (entry) => setSize(entry.contentRect));
  return size;
};
