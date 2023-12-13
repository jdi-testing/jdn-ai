import React from 'react';
import { AnnotationType, LocatorType } from '../../../common/types/common';
import { ElementLibrary, ElementClass } from '../types/generationClasses.types';
import { ILocator, LocatorValue } from '../types/locator.types';
import { CALCULATING } from './constants';
import { camelCase } from 'lodash';

const getLocatorAnnotationStringByType = (value: string, locatorType: LocatorType, annotationType: AnnotationType) => {
  if (annotationType === AnnotationType.FindBy) return value;
  const isDataAttributes = locatorType.startsWith('data-');

  // else return annotation string for UI Annotation Type:
  const annotations = {
    xPath: value,
    'CSS Selector': value,
    id: `#${value}`,
    name: `[name="${value}"]`,
    tagName: value,
    className: value
      .split(/\s+/)
      .map((className) => `.${className}`)
      .join(''),
    linkText: value,
    dataAttributes: `[${locatorType}='${value}']`,
  };

  if (isDataAttributes) {
    return annotations.dataAttributes;
  }

  return annotations[locatorType];
};

export const getLocatorValueByType = (locatorValue: LocatorValue, type: LocatorType): string => {
  let dataAttribute = '';

  const value = {
    'CSS Selector': locatorValue.cssSelector || CALCULATING,
    xPath: locatorValue.xPath ?? '',
    id: locatorValue.attributes.id ?? '',
    name: locatorValue.attributes.name ?? '',
    tagName: locatorValue.attributes.tagName ?? '',
    className: locatorValue.attributes.className ?? '',
    linkText: locatorValue.attributes.linkText ?? '',
    dataAttributes: dataAttribute,
  };

  if (locatorValue.attributes.dataAttributes && type.startsWith('data-')) {
    dataAttribute = locatorValue.attributes.dataAttributes[type] ?? '';

    value[type] = dataAttribute;
  }

  if (value[type]) {
    return value[type];
  } else {
    console.warn(`can't find this type: ${type}`);
    return ``;
  }
};

export const getLocator = (locatorValue: LocatorValue, locatorType: LocatorType = LocatorType.xPath) => {
  const locatorValueByType = getLocatorValueByType(locatorValue, locatorType);

  if (locatorType === LocatorType.cssSelector) {
    return locatorValueByType || CALCULATING;
  }

  return locatorValueByType;
};

export const getLocatorPrefix = (annotationType: AnnotationType, locatorType: LocatorType): string => {
  let prefix = '';

  if (annotationType === AnnotationType.FindBy) {
    if (locatorType === LocatorType.cssSelector || locatorType?.startsWith('data-')) {
      prefix = 'css = ';
    } else if (locatorType === LocatorType.xPath) {
      prefix = 'xpath = ';
    } else if (locatorType === LocatorType.className) {
      prefix = 'className = ';
    } else if (locatorType) {
      prefix = `${locatorType} = `;
    }
    return prefix;
  }

  return prefix;
};

export const getLocatorString = (
  annotationType: AnnotationType,
  locatorType: LocatorType,
  locator: LocatorValue,
  type: ElementLibrary | ElementClass,
  name: string,
): string => {
  const locatorOutput = `"${locator.output}"`;

  return `${annotationType}(${getLocatorPrefix(annotationType, locatorType)}${locatorOutput})\npublic ${type} ${name};`;
};

// the same as getLocatorString only with additional formatting and css classes for colorized styles:
export const renderColorizedJdiString = (
  annotationType: AnnotationType,
  locatorType: LocatorType,
  locatorOutput: string,
  type: ElementLibrary | ElementClass,
  name: string,
) => {
  return (
    <>
      <span>
        {annotationType}({getLocatorPrefix(annotationType, locatorType)}
      </span>
      <span className="jdn__locator__output-string">{`"${getLocatorAnnotationStringByType(
        locatorOutput,
        locatorType,
        annotationType,
      )}"`}</span>
      )
      <br />
      <span className="jdn__locator_item-type">public</span>
      <span>&nbsp;{type}&nbsp;</span>
      {name};
    </>
  );
};
// used in the coverage panel in the Copy option of the Context Menu:
export const getLocatorWithJDIAnnotation = (locator: string, locatorType: LocatorType): string =>
  `${AnnotationType.UI}("${getLocatorAnnotationStringByType(locator, locatorType, AnnotationType.UI)}")`;
// used in the coverage panel in the Copy option of the Context Menu:
export const getLocatorWithSelenium = (locator: string, option: string): string =>
  `${AnnotationType.FindBy}(${option} = "${locator}")`;

export const getLocatorTemplateWithVividus = (name: string, locatorType: LocatorType, locator: ILocator): string =>
  `variables.${name}.${locator.type}.${locator.name}=By.${camelCase(locatorType)}`;

export const getFullLocatorVividusString = (name: string, locatorType: LocatorType, locator: ILocator): string =>
  `${getLocatorTemplateWithVividus(name, locatorType, locator)}(${locator.locator.output})`;
