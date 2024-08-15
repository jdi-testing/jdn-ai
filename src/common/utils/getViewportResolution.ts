import connector from '../../pageServices/connector';

export const getViewportResolution = async () => {
  return await connector.attachContentScript(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return { width, height };
  });
};
