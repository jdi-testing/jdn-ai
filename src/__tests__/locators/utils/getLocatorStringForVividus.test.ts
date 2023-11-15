import { getFullLocatorVividusString } from '../../../features/locators/utils/locatorOutput';
import { locatorsListMockForVividus } from './__mocks__/locatorsList.mock';
import { ILocator } from '../../../features/locators/types/locator.types';

test('get full locator string for Vividus', () => {
  locatorsListMockForVividus.forEach((locator) => {
    const { poName, locatorType, vividusOutput } = locator;
    expect(getFullLocatorVividusString(poName, locatorType, locator as unknown as ILocator)).toBe(vividusOutput);
  });
});
