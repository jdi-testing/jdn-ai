/* eslint-disable jest/no-mocks-import */
import { selectLocatorsByPageObject } from '../../features/locators/selectors/locatorsByPO.selectors';
import {
  getRootState,
  selectMockedLocators,
  pageObject0,
  pageObjectXpath,
  pageObjectCssSelector,
} from './__mocks__/selectLocatorsByPageObject.mock';

describe('selectLocatorsByPageObject', () => {
  test('for pageObject.locatorType set to undefined', () => {
    const result = selectLocatorsByPageObject(getRootState(pageObject0));
    expect(result).toStrictEqual(selectMockedLocators(pageObject0));
  });

  test('for pageObject.locatorType set to cssSelector', () => {
    const result = selectLocatorsByPageObject(getRootState(pageObjectCssSelector));
    expect(result).toStrictEqual(selectMockedLocators(pageObjectCssSelector));
  });

  test('for pageObject.locatorType set to xPath', () => {
    const result = selectLocatorsByPageObject(getRootState(pageObjectXpath));
    expect(result).toStrictEqual(selectMockedLocators(pageObjectXpath));
  });
});
