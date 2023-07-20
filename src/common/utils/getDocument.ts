import connector from "../../pageServices/connector";

export const getDocument = async () => {
  const documentResult = await connector.attachContentScript(() => JSON.stringify(document.documentElement.innerHTML));
  return await documentResult[0].result;
};
