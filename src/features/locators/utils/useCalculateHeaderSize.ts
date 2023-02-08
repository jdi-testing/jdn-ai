import { PLUGIN_HEADER_HEIGHT, DEFAULT_BREADCRUMBS_HEIGHT } from "./constants";

export const useCalculateHeaderSize = (
  target: React.RefObject<HTMLDivElement>,
  setHeaderHeight: (height: number) => void
): void | (() => void) => {
  if (!target.current) return;
  let breadcrumbsHeight = target?.current?.clientHeight;
  setHeaderHeight(PLUGIN_HEADER_HEIGHT + breadcrumbsHeight);

  const resizeObserver = new ResizeObserver(() => {
    // Do what you want to do when the size of the element changes
    breadcrumbsHeight = target.current ? target.current.clientHeight : DEFAULT_BREADCRUMBS_HEIGHT;
    setHeaderHeight(PLUGIN_HEADER_HEIGHT + breadcrumbsHeight);
  });

  resizeObserver.observe(target.current);
  return () => resizeObserver.disconnect();
};
