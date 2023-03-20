import { selectLocatorsByPageObject } from "../../features/pageObjects/pageObject.selectors";
import {
  getRootState,
  selectLocators,
  pageObject0,
  pageObjectXpath,
  pageObjectCssSelector,
} from "./__mocks__/selectLocatorsByPageObject.mock";

describe("selectLocatorsByPageObject", () => {
  test("for pageObject.locatorType set to undefined", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObject0));
    expect(_result).toStrictEqual(selectLocators(pageObject0));
  });

  test("for pageObject.locatorType set to cssSelector", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObjectCssSelector));
    expect(_result).toStrictEqual(selectLocators(pageObjectCssSelector));
  });

  test("for pageObject.locatorType set to xPath", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObjectXpath));
    expect(_result).toStrictEqual(selectLocators(pageObjectXpath));
  });
});
