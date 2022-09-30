import { filter } from "lodash";
import { connector } from "../../../services/connector";
import { Locator, LocatorValue } from "../../../store/slices/locatorSlice.types";

export const getLocator = ({ fullXpath, robulaXpath, customXpath }: LocatorValue) => {
  return customXpath || robulaXpath || fullXpath || "";
};

export const isValidJavaVariable = (value: string) => /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);

export const evaluateXpath = (xPath: string) => {
  return chrome.storage.sync.set({ xPath }).then(() => {
    return connector.attachContentScript(async () => {
      return await chrome.storage.sync.get(["xPath"]).then(({ xPath }) => {
        try {
          const nodeSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          const length = nodeSnapshot.snapshotLength;
          const foundElement = nodeSnapshot.snapshotItem(0) as Element;
          const foundHash = foundElement && foundElement.getAttribute("jdn-hash");
          return JSON.stringify({ length, foundHash });
        } catch (error) {
          return "The locator was not found on the page.";
        }
      });
    });
  });
};

export const equalHashes = (jdnHash: string, locators: Locator[]) => filter(locators, { jdnHash });
