import { Locator } from "../../../features/locators/types/locator.types";
import { sortLocatorsWithChildren } from "../../../features/locators/utils/sortLocators";

describe("sortLocatorsWithChildren", () => {
  const input = [
    {
      element_id: "1",
      children: ["2", "5"],
    },
    {
      element_id: "4",
      children: [],
    },
    {
      element_id: "2",
      children: ["3"],
      parent_id: "1",
    },
    {
      element_id: "3",
      children: [],
      parent_id: "2",
    },
    {
      element_id: "5",
      children: ["8"],
      parent_id: "1",
    },
    {
      element_id: "6",
      children: [],
      parent_id: "7",
    },
  ];
  const expectedOutput = [
    {
      element_id: "1",
      children: ["2", "5"],
    },
    {
      element_id: "2",
      children: ["3"],
      parent_id: "1",
    },
    {
      element_id: "3",
      children: [],
      parent_id: "2",
    },
    {
      element_id: "5",
      children: ["8"],
      parent_id: "1",
    },
    {
      element_id: "4",
      children: [],
    },
    {
      element_id: "6",
      children: [],
      parent_id: "7",
    },
  ];

  test("should sort locators with childs", () => {
    const output = sortLocatorsWithChildren(input as Locator[]);
    expect(output).toEqual(expectedOutput);
  });
});
