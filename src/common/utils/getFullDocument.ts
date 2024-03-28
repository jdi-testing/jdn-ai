import connector from '../../pageServices/connector';

export const getFullDocument = async (): Promise<string> => {
  const documentResult = await connector.attachContentScript(() => JSON.stringify(document.documentElement.outerHTML));
  return documentResult[0].result;
};
