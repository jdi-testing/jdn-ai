export const utilityScript = () => {
  const evaluateXpath = ({ xPath, element_id, originJdnHash }: Record<string, string>) => {
    try {
      const nodeSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const length = nodeSnapshot.snapshotLength;
      const foundElement = nodeSnapshot.snapshotItem(0) as Element;
      const foundHash = foundElement && foundElement.getAttribute("jdn-hash");
      return JSON.stringify({ length, foundHash, element_id, foundElement: foundElement.outerHTML, originJdnHash });
    } catch (error) {
      return "The locator was not found on the page.";
    }
  };

  const assignJdnHash = ({ xpath, jdnHash }: Record<string, string>) => {
    try {
      const nodeSnapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const length = nodeSnapshot.snapshotLength;
      const foundElement = nodeSnapshot.snapshotItem(0) as Element;
      if (length === 1) {
        foundElement.setAttribute("jdn-hash", jdnHash);
        return "success";
      } else {
        return "The locator was not found on the page.";
      }
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
        sendResponse(evaluateXpath(param));
        break;
      case "ASSIGN_JDN_HASH":
        sendResponse(assignJdnHash(param));
        break;
      default:
        break;
    }
  });
};
