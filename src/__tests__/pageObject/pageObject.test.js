import {
  locators,
  pageObjectHTML,
  pageObjectMUI,
  pageObjectVuetify,
} from "../__mocks__/pageObjectMocks/pageObject.mock";
import { elementsWithoutNames } from "../__mocks__/pageObjectMocks/elementsWithoutNames";
import { elementsWithNames } from "../__mocks__/pageObjectMocks/elementsWithNames";
import { pageObjectsNames } from "../__mocks__/pageObjectMocks/pageObjectNames";
import { ElementLibrary } from "../../features/locators/types/generationClasses.types";
import { pageObjectTemplate } from "../../features/pageObjects/utils/pageObjectTemplate";
import { createLocatorNames } from "../../features/pageObjects/utils/pageObject";
import { getClassName } from "../../features/pageObjects/utils/pageObjectTemplate";

const templateTestData = [
  {
    input: "HTML",
    output: pageObjectHTML,
  },
  {
    input: "MUI",
    output: pageObjectMUI,
  },
  {
    input: "Vuetify",
    output: pageObjectVuetify,
  },
];

describe("page object code generation", () => {
  templateTestData.forEach(({ input, output }) => {
    test(`page object generated with ${input}`, () => {
      const page = pageObjectTemplate(locators, "HomePage", input);
      expect(page.pageCode).toBe(output);
      expect(page.title).toBe("HomePage");
    });
  });

  test("generate page object name", () => {
    pageObjectsNames.forEach((poName) => {
      expect(getClassName(poName.input)).toBe(poName.output);
    });
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames, ElementLibrary.MUI)).toStrictEqual(elementsWithNames);
  });
});
