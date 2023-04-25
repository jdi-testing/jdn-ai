export const utilityScript = () => {
  const evaluateXpath = ({ xPath, element_id, originJdnHash }: Record<string, string>) => {
    try {
      const nodeSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const length = nodeSnapshot.snapshotLength;
      const foundElement = nodeSnapshot.snapshotItem(0) as Element;

      const foundHash = foundElement && foundElement.getAttribute("jdn-hash");
      const foundElementText = foundElement.textContent;
      return JSON.stringify({ length, foundHash, element_id, foundElementText, originJdnHash });
    } catch (error) {
      return "The locator was not found on the page.";
    }
  };

  const evaluateCssSelector = ({ selector, element_id, originJdnHash }: Record<string, string>) => {
    try {
      //it works without validation now
      const foundElements = document.querySelectorAll(selector);
      const length = foundElements.length;

      const foundHash = foundElements && foundElements[0].getAttribute("jdn-hash");
      const foundElementText = foundElements[0].textContent;
      return JSON.stringify({ length, foundHash, element_id, foundElementText, originJdnHash });
    } catch (error) {
      return "The locator was not found on the page.";
    }
  };

  const assignJdnHash = ({ locator, jdnHash, isCSSLocator }: Record<string, string>) => {
    try {
      let foundElement, length;
      if (isCSSLocator) {
        const foundElements = document.querySelectorAll(locator);
        foundElement = foundElements[0];
        length = foundElements.length;
      } else {
        const nodeSnapshot = document.evaluate(locator, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        length = nodeSnapshot.snapshotLength;
        foundElement = nodeSnapshot.snapshotItem(0) as Element;
      }
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
      case "EVALUATE_CSS_SELECTOR":
        sendResponse(evaluateCssSelector(param));
        break;
      case "ASSIGN_JDN_HASH":
        sendResponse(assignJdnHash(param));
        break;
      default:
        break;
    }
  });
};
