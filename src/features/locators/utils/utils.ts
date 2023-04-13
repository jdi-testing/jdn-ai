import { chain, filter } from "lodash";
import { sendMessage } from "../../../pageServices/connector";
import { ElementLibrary } from "../types/generationClasses.types";
import { createElementName } from "../../pageObjects/utils/pageObject";
import {
  Locator,
  LocatorValue,
  LocatorValidationWarnings,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  ValidationStatus,
} from "../types/locator.types";
import { copyToClipboard, getLocatorString } from "../../../common/utils/helpers";
import { LocatorOption } from "./constants";
import { getXPathByPriority, getLocator } from "./locatorOutput";
import { LocatorType } from "../../../common/types/common";
import { isStringContainsNumbers } from "../../../common/utils/helpers";

export const getLocatorWithJDIAnnotation = (locator: LocatorValue): string => `@UI("${getXPathByPriority(locator)}")`;

export const getLocatorWithSelenium = (locator: LocatorValue): string =>
  `@FindBy(xpath = "${getXPathByPriority(locator)}")`;

export const isValidJavaVariable = (value: string) => /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);

export const evaluateXpath = (xPath: string, originJdnHash?: string) => {
  return sendMessage.evaluateXpath({ xPath, originJdnHash }).then((response) => {
    return response;
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

export const copyLocator = (
  selectedLocators: Pick<Locator, "locator" | "type" | "name">[],
  option?: LocatorOption
) => (): void => {
  let xPath: string;
  switch (option) {
    case LocatorOption.Xpath:
      xPath = selectedLocators.map(({ locator }) => `"${getXPathByPriority(locator)}"`).join("\n");
      break;
    case LocatorOption.XpathAndSelenium:
      xPath = selectedLocators.map(({ locator }) => getLocatorWithSelenium(locator)).join("\n");
      break;
    case LocatorOption.XpathAndJDI:
      xPath = selectedLocators.map(({ locator }) => getLocatorWithJDIAnnotation(locator)).join("\n");
      break;
    case LocatorOption.CSSSelector:
      xPath = selectedLocators.map(({ locator }) => `"${getLocator(locator, LocatorType.cssSelector)}"`).join("\n");
      break;
    default:
      xPath = selectedLocators.map(({ locator, type, name }) => getLocatorString(locator, type, name)).join("\n");
  }

  copyToClipboard(xPath);
};

export const getLocatorValidationStatus = (message: LocatorValidationErrorType): ValidationStatus | undefined => {
  switch (true) {
    case Object.values(LocatorValidationErrors).includes(message as LocatorValidationErrors) ||
      isStringContainsNumbers(message):
      return ValidationStatus.ERROR;
    case Object.values(LocatorValidationWarnings).includes(message as LocatorValidationWarnings):
      return ValidationStatus.WARNING;
    case !message?.length:
      return ValidationStatus.SUCCESS;
    default:
      return;
  }
};

export const isValidLocator = (message?: string) => !message?.length;
