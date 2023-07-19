import { locatorMocks } from "./__mocks__/locatorEscaped.mock";
import { escapeLocator } from "../../../common/utils/helpers";

test("escape symbols in locator", () => {
  locatorMocks.forEach((locator) => {
    expect(escapeLocator(locator.input)).toBe(locator.output);
  });
});
