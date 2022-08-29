import { createLocatorNames } from "../../components/PageObjects/utils/pageObject";
import { pageObjectTemplate } from "../../components/PageObjects/utils/pageObjectTemplate";
import { elementLibrary } from "../../components/PageObjects/utils/generationClassesMap";
import {
  elementsWithNames,
  elementsWithoutNames,
  locators,
  pageObject,
} from "../__mocks__/pageObject.mock";

describe("page object code generation", () => {
  test("page object generated", () => {
    const page = pageObjectTemplate(locators, "HomePage", [elementLibrary.HTML5, elementLibrary.MUI]);
    expect(page.pageCode).toBe(pageObject);
    expect(page.title).toBe("HomePage");
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames, elementLibrary.MUI)).toStrictEqual(elementsWithNames);
  });
});
