import React from 'react';
import { AnnotationType, LocatorType } from '../../../common/types/common';
import { ElementLibrary, ElementClass } from '../types/generationClasses.types';
import { ILocator, LocatorValue } from '../types/locator.types';
import { CALCULATING } from './constants';
import { camelCase } from 'lodash';

const getLocatorAnnotationStringByType = (value: string, locatorType: LocatorType, annotationType: AnnotationType) => {
  if (annotationType === AnnotationType.FindBy) return value;
  // else return annotation string for UI Annotation Type:
  const annotations = {
    'CSS Selector': value,
    xPath: value,
    id: `#${value}`,
    name: `[name='${value}']`,
    tagName: value,
    className: `.${value}`,
    linkText: value,
    dataAttributes: value,
  };

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

export const getLocator = (
  annotationType: AnnotationType,
  locatorValue: LocatorValue,
  locatorType: LocatorType = LocatorType.xPath,
) => {
  const preparedLocatorType = locatorType.startsWith('data-') ? LocatorType.dataAttributes : locatorType;
  const annotationString: string = getLocatorAnnotationStringByType(
    getLocatorValueByType(locatorValue, locatorType),
    preparedLocatorType,
    annotationType,
  );

  if (locatorType === LocatorType.cssSelector) {
    return annotationString || CALCULATING;
  }

  return annotationString;
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
      <span className="jdn__locator__output-string">{`"${locatorOutput}"`}</span>)
      <br />
      <span className="jdn__locator_item-type">public</span>
      <span>&nbsp;{type}&nbsp;</span>
      {name};
    </>
  );
};

export const getLocatorWithJDIAnnotation = (locator: string): string => `${AnnotationType.UI}("${locator}")`;

export const getLocatorWithSelenium = (locator: string, option: string): string =>
  `${AnnotationType.FindBy}(${option} = "${locator}")`;

export const getLocatorTemplateWithVividus = (name: string, locatorType: LocatorType, locator: ILocator): string =>
  `variables.${name}.${locator.type}.${locator.name}=By.${camelCase(locatorType)}`;

export const getFullLocatorVividusString = (name: string, locatorType: LocatorType, locator: ILocator): string =>
  `${getLocatorTemplateWithVividus(name, locatorType, locator)}(${locator.locator.output})`;
