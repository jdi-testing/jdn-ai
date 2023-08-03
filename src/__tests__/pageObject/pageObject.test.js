import {
  pageObjectMUI,
  pageObjectHTML,
  pageObjectVuetify,
  pageObjectHTMLWithFindBy,
  getLocatorsByAnnotationType,
} from "../__mocks__/pageObjectMocks/pageObject.mock";
import { elementsWithoutNames } from "../__mocks__/pageObjectMocks/elementsWithoutNames";
import { elementsWithNames } from "../__mocks__/pageObjectMocks/elementsWithNames";
import { pageObjectsNames } from "../__mocks__/pageObjectMocks/pageObjectNames";
import { ElementLibrary } from "../../features/locators/types/generationClasses.types";
import { pageObjectTemplate } from "../../features/pageObjects/utils/pageObjectTemplate";
import { createLocatorNames } from "../../features/pageObjects/utils/pageObject";
import { getClassName } from "../../features/pageObjects/utils/pageObjectTemplate";
import { AnnotationType } from "../../common/types/common";

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

const templateTestDataWithFindBy = {
  input: "HTML",
  output: pageObjectHTMLWithFindBy,
};

describe("page object code generation", () => {
  const locators = getLocatorsByAnnotationType(AnnotationType.UI);
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

  describe("pageObjectTemplate should return pageObjectHTML with FindBy import", () => {
    const locators = getLocatorsByAnnotationType(AnnotationType.FindBy);
    test(`when page object generated with ${templateTestDataWithFindBy.input} and locators has Annotation Type === 'FindBy'`, () => {
      const page = pageObjectTemplate(locators, "HomePage", templateTestDataWithFindBy.input);
      expect(page.pageCode).toBe(templateTestDataWithFindBy.output);
      expect(page.title).toBe("HomePage");
    });
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames, ElementLibrary.MUI)).toStrictEqual(elementsWithNames);
  });
});
