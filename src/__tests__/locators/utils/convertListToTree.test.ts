import { convertListToTree } from "../../../features/locators/utils/locatorsTreeUtils";
import { locatorsListMock } from "./__mocks__/locatorsList.mock";
import { locatorsTreeMock } from "./__mocks__/locatorsTree.mock";
import { locatorsTreeMockSearch } from "./__mocks__/locatorsTreeSearch.mock";
import { locatorsTreeMockSearchTypesNames } from "./__mocks__/locatorsTreeSearchNamesTypes.mock";

describe("convertListToTree function", () => {
  test("convert list to tree", () => {
    const tree = convertListToTree(locatorsListMock);
    expect(tree).toEqual(locatorsTreeMock);
  });

  test("convert list to tree with a searchString, with proper depth", () => {
    const tree = convertListToTree(locatorsListMock, "Li7");
    expect(tree).toEqual(locatorsTreeMockSearch);
  });

  test("convert list to tree with a searchString, filter properly by names and types", () => {
    const tree = convertListToTree(locatorsListMock, "Bread");
    expect(tree).toEqual(locatorsTreeMockSearchTypesNames);
  });
});
