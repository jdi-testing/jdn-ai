import { selectLocatorsByPageObject } from "../../features/locators/selectors/locatorsByPO.selectors";
import {
  getRootState,
  selectMockedLocators,
  pageObject0,
  pageObjectXpath,
  pageObjectCssSelector,
} from "./__mocks__/selectLocatorsByPageObject.mock";

describe("selectLocatorsByPageObject", () => {
  test("for pageObject.locatorType set to undefined", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObject0));
    expect(_result).toStrictEqual(selectMockedLocators(pageObject0));
  });

  test("for pageObject.locatorType set to cssSelector", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObjectCssSelector));
    expect(_result).toStrictEqual(selectMockedLocators(pageObjectCssSelector));
  });

  test("for pageObject.locatorType set to xPath", () => {
    const _result = selectLocatorsByPageObject(getRootState(pageObjectXpath));
    expect(_result).toStrictEqual(selectMockedLocators(pageObjectXpath));
  });
});
