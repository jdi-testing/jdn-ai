export const utilityScript = () => {
  const evaluate = ({ xPath, originJdnHash }: Record<string, string>) => {
    try {
      const nodeSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const length = nodeSnapshot.snapshotLength;
      const foundElement = nodeSnapshot.snapshotItem(0) as Element;
      const foundHash = foundElement && foundElement.getAttribute("jdn-hash");
      return JSON.stringify({ length, foundHash, originJdnHash });
    } catch (error) {
      return "The locator was not found on the page.";
    }
  };

  chrome.runtime.onMessage.addListener(({ message, param }, sender, sendResponse) => {
    switch (message) {
      case "PING_SCRIPT":
        if (param.scriptName === "utilityScript") sendResponse({ message: true });
        break;
      case "EVALUATE_XPATH":
        sendResponse(evaluate(param));
        break;
      default:
        break;
    }
  });
};
