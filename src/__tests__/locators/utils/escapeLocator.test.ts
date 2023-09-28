import { escapeLocator } from '../../../features/locators/utils/copyLocatorToClipboard';
import { locatorMocks } from './__mocks__/locatorEscaped.mock';

test('escape symbols in locator', () => {
  locatorMocks.forEach((locator) => {
    expect(escapeLocator(locator.input)).toBe(locator.output);
  });
});
