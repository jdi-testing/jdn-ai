import { convertListToTree } from "../features/locators/locatorsTree/utils";
import { floatToPercent } from "../common/utils/helpers";
import { locatorsListMock } from "./__mocks__/locatorsList.mock";
import { locatorsTreeMock } from "./__mocks__/locatorsTree.mock";

describe("Convert float to Percent function", () => {
  test("convert 0.55 to 55", () => {
    const value = floatToPercent(0.55);
    expect(value).toBe(55);
  });

  test("convert 0 to 0", () => {
    const value = floatToPercent(0);
    expect(value).toBe(0);
  });

  test("convert 1 to 100", () => {
    const value = floatToPercent(1);
    expect(value).toBe(100);
  });

  test("convert 0.07 to 7", () => {
    const value = floatToPercent(0.07);
    expect(value).toBe(7);
  });

  test("convert undefined to 0", () => {
    const value = floatToPercent(undefined);
    expect(value).toBe(NaN);
  });

  test("convert NaN to 0", () => {
    const value = floatToPercent(NaN);
    expect(value).toBe(NaN);
  });
});

describe("convertListToTree function", () => {
  test("convert list to tree", () => {
    const tree = convertListToTree(locatorsListMock);
    expect(tree).toEqual(locatorsTreeMock);
  });
});
