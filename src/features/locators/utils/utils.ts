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
  LocatorTaskStatus,
} from "../types/locator.types";
import { getElementFullXpath } from "../../../common/utils/helpers";
import { LocatorOption } from "./constants";
import { LocatorType } from "../../../common/types/common";
import { isStringContainsNumbers } from "../../../common/utils/helpers";
import { FormInstance } from "antd/es/form/Form";
import { copyLocatorsToClipboard } from "./copyLocatorToClipboard";
import { getLocatorString, getLocatorWithJDIAnnotation, getLocatorWithSelenium } from "./locatorOutput";

export const isValidJavaVariable = (value: string) => /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);

// wishes for future refactorings: get rid these three functions and call sendMessage<> directly
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
  let value: string[];
  switch (option) {
    case LocatorOption.Xpath:
      value = locatorsForCopy.map(({ locator }) => `"${locator.xPath}"`);
      break;
    case LocatorOption.XpathAndSelenium:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithSelenium(locator.xPath, "xpath"));
      break;
    case LocatorOption.XpathAndJDI:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithJDIAnnotation(locator.xPath));
      break;
    case LocatorOption.CSSSelector:
      value = locatorsForCopy.map(({ locator }) => `"${locator.cssSelector}"`);
      break;
    case LocatorOption.CSSAndSelenium:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithSelenium(locator.cssSelector, "css"));
      break;
    case LocatorOption.CSSAndJDI:
      value = locatorsForCopy.map(({ locator }) => getLocatorWithJDIAnnotation(locator.cssSelector));
      break;
    default:
      value = locatorsForCopy
        .map(({ annotationType, locatorType, locator, type, name }) =>
          getLocatorString(annotationType, locatorType, locator, type, name)
        );
  }

  copyLocatorsToClipboard(value);
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

export const getTaskStatus = (locator: LocatorValue) => {
  const { xPathStatus, cssSelectorStatus } = locator;
  if (!xPathStatus && !cssSelectorStatus) return;
  if (xPathStatus === LocatorTaskStatus.SUCCESS && cssSelectorStatus === LocatorTaskStatus.SUCCESS) {
    return LocatorTaskStatus.SUCCESS;
  }
  if (xPathStatus === LocatorTaskStatus.PENDING || cssSelectorStatus === LocatorTaskStatus.PENDING) {
    return LocatorTaskStatus.PENDING;
  }
  if (xPathStatus === LocatorTaskStatus.FAILURE || cssSelectorStatus === LocatorTaskStatus.FAILURE) {
    return LocatorTaskStatus.FAILURE;
  }
  if (xPathStatus === LocatorTaskStatus.REVOKED || cssSelectorStatus === LocatorTaskStatus.REVOKED) {
    return LocatorTaskStatus.REVOKED;
  }
  // fallback for any unhandled cases
  return xPathStatus || cssSelectorStatus;
};

export const hasAllLocators = ({ locator }: Locator) =>
  locator && locator.xPath !== locator.fullXpath && locator.cssSelector;

export const getNoLocatorsElements = (locators: Locator[]) => locators.filter((locator) => !hasAllLocators(locator));
