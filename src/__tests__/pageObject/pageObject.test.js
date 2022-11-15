import { createLocatorNames } from "../../components/PageObjects/utils/pageObject";
import { pageObjectTemplate } from "../../components/PageObjects/utils/pageObjectTemplate";
import { ElementLibrary } from "../../components/PageObjects/utils/generationClassesMap";
import {
  locators,
  pageObject,
} from "../__mocks__/pageObjectMocks/pageObject.mock";
import { elementsWithoutNames } from "../__mocks__/pageObjectMocks/elementsWithoutNames";
import { elementsWithNames } from "../__mocks__/pageObjectMocks/elementsWithNames";

describe("page object code generation", () => {
  test("page object generated", () => {
    const page = pageObjectTemplate(locators, "HomePage", [ElementLibrary.HTML5, ElementLibrary.MUI]);
    expect(page.pageCode).toBe(pageObject);
    expect(page.title).toBe("HomePage");
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames, ElementLibrary.MUI)).toStrictEqual(elementsWithNames);
  });
});
