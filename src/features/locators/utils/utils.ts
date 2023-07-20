import { chain } from "lodash";
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
  ElementId,
  JDNHash,
} from "../types/locator.types";
import { getLocatorString, getElementFullXpath } from "../../../common/utils/helpers";
import { LocatorOption } from "./constants";
import { LocatorType } from "../../../common/types/common";
import { isStringContainsNumbers } from "../../../common/utils/helpers";
import { FormInstance } from "antd/es/form/Form";
import { copyToClipboard } from "../../../common/utils/copyToClipboard";

export const getLocatorWithJDIAnnotation = (locator: string): string => `@UI("${locator}")`;

export const getLocatorWithSelenium = (locator: string, option: string): string => `@FindBy(${option} = "${locator}")`;

export const isValidJavaVariable = (value: string) => /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);

export const evaluateXpath = (xPath: string, element_id?: ElementId, originJdnHash?: string) =>
  sendMessage.evaluateXpath({ xPath, element_id, originJdnHash });

export const evaluateCssSelector = (selector: string, element_id?: ElementId, originJdnHash?: string) =>
  sendMessage.evaluateCssSelector({ selector, element_id, originJdnHash });

export const generateSelectorByHash = (element_id: ElementId, jdnHash: string) =>
  sendMessage.generateSelectorByHash({ element_id, jdnHash });

export const checkDuplicates = (jdnHash: string, locators: Locator[], element_id: ElementId) =>
  locators.filter(
    ({ jdnHash: _jdnHash, message, element_id: _element_id }) =>
      _jdnHash === jdnHash && isValidLocator(message) && _element_id !== element_id
  );

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

export const copyLocator = (locatorsForCopy: Locator[], option?: LocatorOption) => (): void => {
  let value: string;
  switch (option) {
    case LocatorOption.Xpath:
      value = locatorsForCopy.map(({ locator }) => `"${locator.xPath}"`).join("\n");
      break;
    case LocatorOption.XpathAndSelenium:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithSelenium(locator.xPath, "xpath")).join("\n");
      break;
    case LocatorOption.XpathAndJDI:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithJDIAnnotation(locator.xPath)).join("\n");
      break;
    case LocatorOption.CSSSelector:
      value = locatorsForCopy.map(({ locator }) => `"${locator.cssSelector}"`).join("\n");
      break;
    case LocatorOption.CSSAndSelenium:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithSelenium(locator.cssSelector, "css")).join("\n");
      break;
    case LocatorOption.CSSAndJDI:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithJDIAnnotation(locator.cssSelector)).join("\n");
      break;
    default:
      value = locatorsForCopy.map(({ locator, type, name }) => getLocatorString(locator, type, name)).join("\n");
  }

  copyToClipboard(value);
};

export const getCopyOptions = (selectedLocators: Locator[]) => {
  return Object.values(LocatorOption).reduce((options, option) => {
    options[option as LocatorOption] = copyLocator(selectedLocators, option);
    return options;
  }, {} as Record<LocatorOption, () => void>);
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

export const isValidLocator = (message?: string) => !message || message === LocatorValidationWarnings.NewElement;

export const getLocatorValueOnTypeSwitch = async (
  newLocatorType: LocatorType,
  validationMessage: LocatorValidationErrorType,
  element_id: ElementId,
  jdnHash: JDNHash,
  locator: LocatorValue,
  form: FormInstance
) => {
  const isLocatorLeadsToNewElement = validationMessage === LocatorValidationWarnings.NewElement;
  const isCSSLocator = newLocatorType === LocatorType.cssSelector;

  let newLocatorValue;

  if (isCSSLocator) {
    if (isLocatorLeadsToNewElement || !locator.cssSelector) {
      const { foundHash } = JSON.parse(await evaluateXpath(form.getFieldValue("locator"), element_id, jdnHash));
      ({ cssSelector: newLocatorValue } = await generateSelectorByHash(element_id, foundHash));
    } else {
      newLocatorValue = locator.cssSelector;
    }
  } else {
    if (isLocatorLeadsToNewElement || !locator.xPath) {
      const { foundHash } = JSON.parse(await evaluateCssSelector(form.getFieldValue("locator"), element_id));
      newLocatorValue = await getElementFullXpath(foundHash);
    } else {
      newLocatorValue = locator.xPath;
    }
  }

  return newLocatorValue;
};
