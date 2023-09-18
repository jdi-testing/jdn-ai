import { ILocator } from "../../../features/locators/types/locator.types";
import { convertToListWithChildren } from "../../../features/locators/utils/locatorsTreeUtils";

describe("convertToListWithChildren", () => {
  const inputList: Partial<ILocator>[] = [
    {
      element_id: "1",
      jdnHash: "hash1",
      name: "Element 1",
      parent_id: "",
      isGenerated: true,
    },
    {
      element_id: "2",
      jdnHash: "hash2",
      name: "Element 2",
      parent_id: "hash1",
      isGenerated: true,
    },
    {
      element_id: "3",
      jdnHash: "hash3",
      name: "Element 3",
      parent_id: "hash2",
      isGenerated: true,
    },
    {
      element_id: "4",
      jdnHash: "hash4",
      name: "Element 4",
      parent_id: "",
      isGenerated: true,
    },
  ];

  const expectedOutput: Partial<ILocator>[] = [
    {
      element_id: "1",
      jdnHash: "hash1",
      name: "Element 1",
      parent_id: "",
      isGenerated: true,
      children: ["2"],
    },
    {
      element_id: "2",
      jdnHash: "hash2",
      name: "Element 2",
      parent_id: "hash1",
      isGenerated: true,
      children: ["3"],
    },
    {
      element_id: "3",
      jdnHash: "hash3",
      name: "Element 3",
      parent_id: "hash2",
      isGenerated: true,
      children: [],
    },
    {
      element_id: "4",
      jdnHash: "hash4",
      name: "Element 4",
      parent_id: "",
      isGenerated: true,
      children: [],
    },
  ];

  const inputList2: Partial<ILocator>[] = [
    {
      element_id: "1",
      jdnHash: "hash1",
      name: "Element 1",
      parent_id: "",
      isGenerated: true,
    },
    {
      element_id: "2",
      jdnHash: "hash2",
      name: "Element 2",
      isGenerated: true,
    },
    {
      element_id: "3",
      jdnHash: "hash3",
      name: "Element 3",
      parent_id: "hash2",
      isGenerated: true,
    },
  ];
  const expectedOutput2: Partial<ILocator>[] = [
    {
      element_id: "1",
      jdnHash: "hash1",
      name: "Element 1",
      parent_id: "",
      isGenerated: true,
      children: [],
    },
    {
      element_id: "2",
      jdnHash: "hash2",
      name: "Element 2",
      isGenerated: true,
      children: ["3"],
    },
    {
      element_id: "3",
      jdnHash: "hash3",
      name: "Element 3",
      parent_id: "hash2",
      isGenerated: true,
      children: [],
    },
  ];

  test("should return empty array if input list is empty", () => {
    expect(convertToListWithChildren([])).toEqual([]);
  });

  test("should correctly convert list of locators to list with children", () => {
    expect(convertToListWithChildren(inputList as ILocator[])).toEqual(expectedOutput);
  });

  test("should not modify the input list", () => {
    const inputListCopy = JSON.parse(JSON.stringify(inputList)); // Deep copy
    convertToListWithChildren(inputList as ILocator[]);
    expect(inputList).toEqual(inputListCopy);
  });

  test("should handle missing parent_id gracefully", () => {
    expect(convertToListWithChildren(inputList2 as ILocator[])).toEqual(expectedOutput2);
  });
});
