import { chain } from 'lodash';
import { sendMessage } from '../../../pageServices/connector';
import { ElementLibrary } from '../types/generationClasses.types';
import { createElementName } from '../../pageObjects/utils/pageObject';
import {
  ILocator,
  LocatorValue,
  LocatorValidationWarnings,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  ValidationStatus,
  ElementId,
  JDNHash,
  LocatorTaskStatus,
} from '../types/locator.types';
import { getElementFullXpath, isStringContainsNumbers } from '../../../common/utils/helpers';
import { LocatorOption } from './constants';
import { FrameworkType, LocatorType } from '../../../common/types/common';

import { copyLocatorsToClipboard } from './copyLocatorToClipboard';
import {
  getFullLocatorVividusString,
  getLocatorString,
  getLocatorValueByType,
  getLocatorWithJDIAnnotation,
  getLocatorWithSelenium,
} from './locatorOutput';
import { FormInstance } from 'rc-field-form/lib/interface';
import { FormValues } from '../components/LocatorEditDialog';

export const isValidJavaVariable = (value: string) => /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);

// wishes for future refactorings: get rid these three functions and call sendMessage<> directly
export const evaluateXpath = (xPath: string, element_id?: ElementId, originJdnHash?: string) =>
  sendMessage.evaluateXpath({ xPath, element_id, originJdnHash });

export const evaluateStandardLocator = (
  selector: string,
  locatorType: LocatorType,
  element_id?: ElementId,
  originJdnHash?: string,
) => sendMessage.evaluateStandardLocator({ selector, locatorType, element_id, originJdnHash });

const prepareLocatorStringForEvaluation = (type: LocatorType, string: string): string => {
  if (type === LocatorType.id) return `#${string}`;
  if (type === LocatorType.className) return `.${string}`;
  if (type === LocatorType.name) return `[name="${string}"]`;
  return string;
};

export const evaluateLocator = async (
  locatorString: string,
  locatorType: LocatorType,
  elementId: ElementId,
  jdnHash?: string,
) => {
  if (locatorType === LocatorType.xPath) return evaluateXpath(locatorString, elementId, jdnHash);
  else {
    const preparedValue = prepareLocatorStringForEvaluation(locatorType, locatorString);
    return evaluateStandardLocator(preparedValue, locatorType, elementId, jdnHash);
  }
};

export const generateSelectorByHash = (element_id: ElementId, jdnHash: string) =>
  sendMessage.generateSelectorByHash({ element_id, jdnHash });

export const isValidLocator = (message?: LocatorValidationErrorType) => {
  return !message || message === LocatorValidationWarnings.NewElement;
};

export const checkDuplicates = (foundHash: string, locators: ILocator[], element_id: ElementId) =>
  locators.filter(
    ({ jdnHash, message, element_id: _element_id }) =>
      jdnHash === foundHash && isValidLocator(message) && _element_id !== element_id,
  );

export const createNewName = (
  element: ILocator,
  newType: string,
  library: ElementLibrary,
  elements: ILocator[],
): string => {
  const names = chain(elements).map('name').without(element.name).value();
  const newName = createElementName({ ...element }, library, names, newType);

  return newName;
};

export const setIndents = (ref: React.RefObject<HTMLDivElement>, depth: number) => {
  const jdnIndentClass = 'jdn__tree-indent';

  const container = ref.current?.closest('.ant-tree-treenode');
  const indentContainer = container?.querySelector('.ant-tree-indent');
  if (!indentContainer) return;
  while ((indentContainer?.childElementCount || 0) < depth) {
    const indentElement = indentContainer?.querySelector(':first-child');
    if (!indentElement) break;
    const jdnIndentDiv = document.createElement('span');
    jdnIndentDiv.className = jdnIndentClass;
    indentContainer?.appendChild(jdnIndentDiv);
  }
  while ((indentContainer?.childElementCount || 0) > depth) {
    const indentElement = indentContainer?.querySelector(`.${jdnIndentClass}`);
    if (indentElement) indentContainer?.removeChild(indentElement);
    else break;
  }
};

// used in the coverage panel in the Copy option of the Context Menu:
export const copyLocator =
  (framework: FrameworkType, locatorsForCopy: ILocator[], option?: LocatorOption) => (): void => {
    const isVividusFramework = framework === FrameworkType.Vividus;
    let value: string[];
    switch (option) {
      case LocatorOption.Xpath:
        value = locatorsForCopy.map(({ locatorValue }) => `"${locatorValue.xPath}"`);
        break;
      case LocatorOption.XpathAndSelenium:
        value = locatorsForCopy.map(({ locatorValue }) => getLocatorWithSelenium(locatorValue.xPath ?? '', 'xpath'));
        break;
      case LocatorOption.XpathAndJDI:
        value = locatorsForCopy.map(({ locatorValue }) =>
          getLocatorWithJDIAnnotation(locatorValue.xPath ?? '', LocatorType.xPath),
        );
        break;
      case LocatorOption.CSSSelector:
        value = locatorsForCopy.map(({ locatorValue }) => `"${locatorValue.cssSelector}"`);
        break;
      case LocatorOption.CSSAndSelenium:
        value = locatorsForCopy.map(({ locatorValue }) =>
          getLocatorWithSelenium(locatorValue.cssSelector ?? '', 'css'),
        );
        break;
      case LocatorOption.CSSAndJDI:
        value = locatorsForCopy.map(({ locatorValue }) =>
          getLocatorWithJDIAnnotation(locatorValue.cssSelector ?? '', LocatorType.cssSelector),
        );
        break;
      default:
        value = locatorsForCopy.map((element) => {
          const { annotationType, locatorValue, type, name } = element;
          const locatorType = element?.locatorType || LocatorType.xPath;

          return isVividusFramework
            ? getFullLocatorVividusString(name, locatorType, element)
            : getLocatorString(annotationType, locatorType, locatorValue, type, name);
        });
    }

    copyLocatorsToClipboard(value, isVividusFramework);
  };

export const getCopyOptions = (framework: FrameworkType, selectedLocators: ILocator[]) => {
  return Object.values(LocatorOption).reduce(
    (options, option) => {
      options[option as LocatorOption] = copyLocator(framework, selectedLocators, option);
      return options;
    },
    {} as Record<LocatorOption, () => void>,
  );
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

export const getLocatorValueOnTypeSwitch = async (
  newLocatorType: LocatorType,
  validationMessage: LocatorValidationErrorType,
  element_id: ElementId,
  jdnHash: JDNHash,
  locatorValue: LocatorValue,
  form: FormInstance<FormValues>,
) => {
  const isLocatorLeadsToNewElement: boolean = validationMessage === LocatorValidationWarnings.NewElement;
  let newLocatorValue;
  const isStandardLocator: boolean =
    newLocatorType === LocatorType.cssSelector ||
    newLocatorType === LocatorType.className ||
    newLocatorType === LocatorType.id ||
    newLocatorType === LocatorType.linkText ||
    newLocatorType === LocatorType.name ||
    newLocatorType === LocatorType.tagName ||
    newLocatorType.startsWith('data-');

  const isDataAttributesFalsy =
    !locatorValue.attributes.dataAttributes || Object.keys(locatorValue.attributes.dataAttributes).length === 0;
  const isStandardLocatorFalsy =
    !locatorValue.cssSelector &&
    !locatorValue.attributes.className &&
    !locatorValue.attributes.id &&
    !locatorValue.attributes.linkText &&
    !locatorValue.attributes.name &&
    !locatorValue.attributes.tagName &&
    isDataAttributesFalsy;

  if (isStandardLocator) {
    if (isLocatorLeadsToNewElement || isStandardLocatorFalsy) {
      const { foundHash } = JSON.parse(await evaluateXpath(form.getFieldValue('locator'), element_id, jdnHash));

      ({ cssSelector: newLocatorValue } = await generateSelectorByHash(element_id, foundHash));
    } else {
      if (newLocatorType === LocatorType.cssSelector) newLocatorValue = locatorValue.cssSelector;
      try {
        newLocatorValue = getLocatorValueByType(locatorValue, newLocatorType);
      } catch (error) {
        console.log('error: ', error);
      }
    }
  } else {
    if (isLocatorLeadsToNewElement || !locatorValue.xPath) {
      const { foundHash } = JSON.parse(
        await evaluateStandardLocator(form.getFieldValue('locator'), newLocatorType, element_id),
      );
      newLocatorValue = await getElementFullXpath(foundHash);
    } else {
      newLocatorValue = locatorValue.xPath;
    }
  }

  return newLocatorValue;
};

export const getTaskStatus = (locatorValue: LocatorValue) => {
  const { xPathStatus, cssSelectorStatus } = locatorValue;
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

export const hasAllLocators = ({ locatorValue }: ILocator) =>
  locatorValue && locatorValue.xPath !== locatorValue.fullXpath && locatorValue.cssSelector;

export const getNoLocatorsElements = (locators: ILocator[]) => locators.filter((locator) => !hasAllLocators(locator));
