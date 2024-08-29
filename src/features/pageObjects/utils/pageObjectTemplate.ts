import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { camelCase, upperFirst } from 'lodash';
import transliterate from '@sindresorhus/transliterate';
import { ILocator } from '../../locators/types/locator.types';
import {
  getLocatorPrefix,
  getLocatorTemplateWithVividusString,
  getLocatorValueByType,
} from '../../locators/utils/locatorOutput';
import { AnnotationType, LocatorType } from '../../../common/types/common';
import { hasAnnotationType } from './hasAnnotationType';
import { PageObject } from '../types/pageObjectSlice.types';

export const getClassName = (title: string) => {
  let className = transliterate(title);
  className = camelCase(className);

  className = className.substring(className.search(/[a-zA-Za]/)); // removing numbers in the start of string
  className = upperFirst(className); // we generate Java class name, so we always need a capital first letter

  if (className.length > 56) className = className.slice(0, 55);
  if (className.length > 4 && className.slice(-4).toLowerCase() !== 'page') className += 'Page';
  return className;
};

export const getPageObjectTemplateForVividus = (
  locators: ILocator[],
  pageObject: PageObject,
): { pageCode: string; title: string } => {
  const { name, pathname, locatorType } = pageObject;
  let pageCode = `variables.${name}.url=${pathname}\n`;

  locators.forEach((locator) => {
    const currentLocatorType = locator.locatorType || locatorType || LocatorType.xPath;

    pageCode += `${getLocatorTemplateWithVividusString(name, currentLocatorType, locator)}(${getLocatorValueByType(
      locator.locatorValue,
      currentLocatorType,
    )})\n`;
  });

  return { pageCode, title: name };
};

const getLocatorStringForTableView = (name: string, locator: ILocator, locatorType: LocatorType): string => {
  return `By.${locatorType === LocatorType.cssSelector ? 'cssSelector' : locatorType}(${getLocatorValueByType(
    locator.locatorValue,
    locatorType,
  )})`;
};

const padString = (str: string, length: number): string => str.padEnd(length);

export const getPageObjectTemplateForVividusTable = (
  locators: ILocator[],
  pageObject: PageObject,
): { pageCode: string; title: string } => {
  const { name, pathname, locatorType } = pageObject;

  const maxNameLength = locators.reduce((maxLength, locator) => {
    return Math.max(maxLength, locator.name.length);
  }, 0);

  const maxLocatorLength = locators.reduce((maxLength, locator) => {
    const currentLocatorType = locator.locatorType || locatorType || LocatorType.xPath;
    const locatorString = getLocatorStringForTableView(name, locator, currentLocatorType);
    return Math.max(maxLength, locatorString.length);
  }, 0);

  let pageCode = `${name}.url=${pathname}\n`;

  locators.forEach((locator) => {
    const currentLocatorType = locator.locatorType || locatorType || LocatorType.xPath;
    const locatorName = padString(locator.name, maxNameLength);
    const locatorString = padString(getLocatorStringForTableView(name, locator, currentLocatorType), maxLocatorLength);
    pageCode += `|${locatorName}|${locatorString}|\n`;
  });

  return { pageCode, title: name };
};

export const getPageObjectTemplateForJdi = (
  locators: ILocator[],
  pageObject: PageObject,
): { pageCode: string; title: string } => {
  const { name: className, library } = pageObject;

  const locatorsCode = locators.map((locator) => {
    const locatorOutput = locator.locatorValue.output;
    const { locatorType } = pageObject;
    const currentLocatorType = locator.locatorType || locatorType || LocatorType.xPath;
    return `    ${locator.annotationType}(${getLocatorPrefix(
      locator.annotationType,
      currentLocatorType,
    )}"${locatorOutput}")\n    public ${locator.type} ${locator.name};`;
  });

  const hasFindByAnnotationType: boolean = hasAnnotationType(locators, AnnotationType.FindBy);

  const pageCode = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
${
  library === ElementLibrary.MUI
    ? `
import com.epam.jdi.light.material.elements.displaydata.*;
import com.epam.jdi.light.material.elements.displaydata.table.*;
import com.epam.jdi.light.material.elements.feedback.*;
import com.epam.jdi.light.material.elements.feedback.progress.*;
import com.epam.jdi.light.material.elements.inputs.*;
import com.epam.jdi.light.material.elements.inputs.transferlist.*;
import com.epam.jdi.light.material.elements.layout.*;
import com.epam.jdi.light.material.elements.navigation.*;
import com.epam.jdi.light.material.elements.navigation.steppers.*;
import com.epam.jdi.light.material.elements.surfaces.*;
import com.epam.jdi.light.material.elements.utils.*;
`
    : ''
}${
    library === ElementLibrary.Vuetify
      ? `
import com.epam.jdi.light.vuetify.elements.common.*;
import com.epam.jdi.light.vuetify.elements.complex.*;
import com.epam.jdi.light.vuetify.elements.complex.bars.*;
import com.epam.jdi.light.vuetify.elements.complex.breadcrumbs.*;
import com.epam.jdi.light.vuetify.elements.complex.panels.*;
import com.epam.jdi.light.vuetify.elements.complex.radiobuttons.*;
import com.epam.jdi.light.vuetify.elements.complex.stepper.*;
import com.epam.jdi.light.vuetify.elements.complex.tables.*;
import com.epam.jdi.light.vuetify.elements.complex.timelines.*;
import com.epam.jdi.light.vuetify.elements.composite.*;
`
      : ''
  }${hasFindByAnnotationType ? `import com.epam.jdi.light.elements.pageobjects.annotations.FindBy;\n` : ''}
public class ${className} extends WebPage {
${locatorsCode.join('\n\n')}
}
`;
  return { pageCode, title: className };
};
