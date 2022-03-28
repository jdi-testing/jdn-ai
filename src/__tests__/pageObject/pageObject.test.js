import { createLocatorNames } from "../../services/pageObject";
import { pageObjectTemplate } from "../../services/pageObjectTemplate";
import {
  elementsWithNames,
  elementsWithoutNames,
  locators,
  pageObject,
} from "../__mocks__/pageObject.mock";

describe("page object code generation", () => {
  test("page object generated", () => {
    const page = pageObjectTemplate(locators, { host: "jdi - testing.github.io" }, "HomePage");
    expect(page.pageCode).toBe(pageObject);
    expect(page.title).toBe("HomePage");
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames)).toStrictEqual(elementsWithNames);
  });
});
