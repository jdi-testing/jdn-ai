import { LocatorType, AnnotationType } from '../common/types/common';
import { getLocator } from '../features/locators/utils/locatorOutput';

const data = [
  {
    input: { xPath: '/html/body/footer', cssSelector: 'html > body > footer', attributes: {} },
    xpathOutput: '/html/body/footer',
    cssOutput: 'html > body > footer',
  },
  {
    input: { xPath: "//*[@class='footer-menu']", cssSelector: '.footer-menu', attributes: {} },
    xpathOutput: "//*[@class='footer-menu']",
    cssOutput: '.footer-menu',
  },
  {
    input: {
      xPath: '//div/button',
      cssSelector: 'div > button',
      attributes: {},
    },
    xpathOutput: '//div/button',
    cssOutput: 'div > button',
  },
  {
    input: {
      xPath: "//*[contains(text(), 'JDI Github')]",
      cssSelector: 'html > body > footer',
      attributes: {},
    },
    xpathOutput: "//*[contains(text(), 'JDI Github')]",
    cssOutput: 'html > body > footer',
  },
];

describe('locator presentation by getLocator()', () => {
  data.forEach((_data) => {
    test(`converts ${JSON.stringify(_data.input, LocatorType.xPath)} to ${_data.xpathOutput}`, () => {
      expect(getLocator(_data.input)).toBe(_data.xpathOutput);
    });
    test(`converts ${JSON.stringify(_data.input, LocatorType.cssSelector)} to ${_data.cssOutput}`, () => {
      expect(getLocator(_data.input, LocatorType.cssSelector)).toBe(_data.cssOutput);
    });
  });
});
