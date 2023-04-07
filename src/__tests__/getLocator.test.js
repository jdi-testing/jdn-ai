import { LocatorType } from "../common/types/common";
import { getLocator } from "../features/locators/utils/locatorOutput";

const data = [
  {
    input: { fullXpath: "/html/body/footer" },
    xpathOutput: "/html/body/footer",
    cssOutput: "html > body > footer",
  },
  {
    input: { fullXpath: "/html/body/footer", robulaXpath: "//*[@class='footer-menu']" },
    xpathOutput: "//*[@class='footer-menu']",
    cssOutput: ".footer-menu",
  },
  {
    input: { fullXpath: "/html/body/footer", robulaXpath: "//*[@class='footer-menu']", customXpath: "//div/button" },
    xpathOutput: "//div/button",
    cssOutput: "div > button",
  },
  {
    input: { fullXpath: "/html/body/footer", robulaXpath: "//*[contains(text(), 'JDI Github')]" },
    xpathOutput: "//*[contains(text(), 'JDI Github')]",
    cssOutput: "html > body > footer",
  },
];

describe("locator presentation by getLocator()", () => {
  data.forEach((_data) => {
    test(`converts ${JSON.stringify(_data.input)} to ${_data.xpathOutput}`, () => {
      expect(getLocator(_data.input)).toBe(_data.xpathOutput);
    });
    test(`converts ${JSON.stringify(_data.input)} to ${_data.cssOutput}`, () => {
      expect(getLocator(_data.input, LocatorType.cssSelector)).toBe(_data.cssOutput);
    });
  });
});
