import { Locator } from "../../../features/locators/types/locator.types";
import { convertListToTree } from "../../../features/locators/utils/locatorsTreeUtils";
import { locatorsListMock } from "../../__mocks__/locatorsList.mock";
import { locatorsTreeMock } from "../../__mocks__/locatorsTree.mock";
import { locatorsTreeMockSearch } from "../../__mocks__/locatorsTreeSearch.mock";


describe("convertListToTree function", () => {
    test("convert list to tree", () => {
      const tree = convertListToTree(locatorsListMock);
      expect(tree).toEqual(locatorsTreeMock);
    });

    test("convert list to tree with a searchString", () => {
      const tree = convertListToTree(locatorsListMock, "Li7");
      expect(tree).toEqual(locatorsTreeMockSearch);
    });
  });