import { chain, filter } from "lodash";
import { connector } from "../../../pageServices/connector";
import { ElementLibrary } from "../../pageObjects/utils/generationClassesMap";
import { createElementName } from "../../pageObjects/utils/pageObject";
import { Locator, LocatorValue } from "../locatorSlice.types";
import { copyToClipboard, getLocatorString } from "../../../common/utils/helpers";

export const getLocator = ({ fullXpath, robulaXpath, customXpath }: LocatorValue) => {
  return customXpath || robulaXpath || fullXpath || "";
};

const getLocatorWithJDIAnnotation = ({ robulaXpath }: LocatorValue): string => `@UI("${robulaXpath}")`;

const getLocatorWithSelenium = ({ robulaXpath }: LocatorValue): string => `@FindBy(xpath = "${robulaXpath}")`;

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

export const createNewName = (
  element: Locator,
  newType: string,
  library: ElementLibrary,
  elements: Locator[]
): string => {
  const names = chain(elements).map("name").without(element.name).value();
  const newName = createElementName({ ...element }, library, names, newType);

  return newName;
};

export const setIndents = (ref: React.RefObject<HTMLDivElement>, depth: number) => {
  const jdnIndentClass = "jdn__tree-indent";

  const container = ref.current?.closest(".ant-tree-treenode");
  const indentContainer = container?.querySelector(".ant-tree-indent");
  if (!indentContainer) return;
  while ((indentContainer?.childElementCount || 0) < depth) {
    const indentElement = indentContainer?.querySelector(":first-child");
    if (!indentElement) break;
    const jdnIndentDiv = document.createElement("span");
    jdnIndentDiv.className = jdnIndentClass;
    indentContainer?.appendChild(jdnIndentDiv);
  }
  while ((indentContainer?.childElementCount || 0) > depth) {
    const indentElement = indentContainer?.querySelector(`.${jdnIndentClass}`);
    if (indentElement) indentContainer?.removeChild(indentElement);
    else break;
  }
};

export enum LocatorOption {
  Xpath = "xPath",
  XpathAndSelenium = "xPath + FindBy",
  XpathAndJDI = "xPath + JDI annotation",
  CSSSelector = "CSS selector",
  FullCode = "Full code",
}

export const copyLocator = (
  selectedLocators: Pick<Locator, "locator" | "type" | "name">[],
  option?: string
) => (): void => {
  let xPath: string;
  switch (option) {
    case LocatorOption.Xpath:
      xPath = selectedLocators.map(({ locator }) => `"${locator.robulaXpath}"`).join("\n");
      break;
    case LocatorOption.XpathAndSelenium:
      xPath = selectedLocators.map(({ locator }) => getLocatorWithSelenium(locator)).join("\n");
      break;
    case LocatorOption.XpathAndJDI:
      xPath = selectedLocators.map(({ locator }) => getLocatorWithJDIAnnotation(locator)).join("\n");
      break;
    default:
      xPath = selectedLocators.map(({ locator, type, name }) => getLocatorString(locator, type, name)).join("\n");
  }

  copyToClipboard(xPath);
};
