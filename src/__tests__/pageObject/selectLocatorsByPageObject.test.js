import { selectLocatorsByPageObject } from "../../features/pageObjects/pageObject.selectors";
import {
  state,
  result,
  pageObject0,
  pageObjectXpath,
  pageObjectCssSelector,
} from "./__mocks__/selectLocatorsByPageObject.mock";

describe("selectLocatorsByPageObject", () => {
  test("for pageObject.locatorType set to undefined", () => {
    const _result = selectLocatorsByPageObject(state(pageObject0));
    expect(_result).toStrictEqual(result(pageObject0));
  });

  test("for pageObject.locatorType set to cssSelector", () => {
    const _result = selectLocatorsByPageObject(state(pageObjectCssSelector));
    expect(_result).toStrictEqual(result(pageObjectCssSelector));
  });

  test("for pageObject.locatorType set to xPath", () => {
    const _result = selectLocatorsByPageObject(state(pageObjectXpath));
    expect(_result).toStrictEqual(result(pageObjectXpath));
  });
});