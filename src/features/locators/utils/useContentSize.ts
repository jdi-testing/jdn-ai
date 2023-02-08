import { useEffect, RefObject } from "react";

export const useContentSize = (
  breadcrumbsRef: RefObject<HTMLDivElement>,
  setLocatorListHeight: (height: number) => void
) => {
  useEffect(() => {
    if (!breadcrumbsRef?.current) return;
    const PLUGIN_HEADER_HEIGHT = 169;
    let breadcrumbsHeight = breadcrumbsRef?.current?.clientHeight;
    setLocatorListHeight(window.innerHeight - PLUGIN_HEADER_HEIGHT - breadcrumbsHeight);

    const resizeObserver = new ResizeObserver(() => {
      // Do what you want to do when the size of the element changes
      breadcrumbsHeight = breadcrumbsRef?.current!.clientHeight;
      setLocatorListHeight(window.innerHeight - PLUGIN_HEADER_HEIGHT - breadcrumbsHeight);
    });

    // resizeObserver.observe(breadcrumbsRef.current);
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);
};
