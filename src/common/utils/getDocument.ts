import connector from "../../pageServices/connector";

export const getFullDocument = async () => {
  const documentResult = await connector.attachContentScript(() => JSON.stringify(document.documentElement.outerHTML));
  return await documentResult[0].result;
};