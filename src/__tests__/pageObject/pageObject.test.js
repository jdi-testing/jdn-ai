import { locators, pageObject } from "../__mocks__/pageObjectMocks/pageObject.mock";
import { elementsWithoutNames } from "../__mocks__/pageObjectMocks/elementsWithoutNames";
import { elementsWithNames } from "../__mocks__/pageObjectMocks/elementsWithNames";
import { pageObjectsNames } from "../__mocks__/pageObjectMocks/pageObjectNames";
import { ElementLibrary } from "../../features/locators/types/generationClassesMap";
import { pageObjectTemplate } from "../../features/pageObjects/utils/pageObjectTemplate";
import { createLocatorNames } from "../../features/pageObjects/utils/pageObject";
import { getClassName } from "../../features/pageObjects/utils/pageObjectTemplate";

describe("page object code generation", () => {
  test("page object generated", () => {
    const page = pageObjectTemplate(locators, "HomePage", [ElementLibrary.HTML5, ElementLibrary.MUI]);
    expect(page.pageCode).toBe(pageObject);
    expect(page.title).toBe("HomePage");
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
