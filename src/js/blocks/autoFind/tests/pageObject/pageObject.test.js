import { pageObjectTemplate } from "../../utils/pageObjectTemplate";
import { locators, pageObject, pageObjectCiryllic } from "./pageObject.mock";

describe("page object code generation", () => {
  test("page object generated", () => {
    const page = pageObjectTemplate(locators, { host: "jdi - testing.github.io" }, "Home Page");
    expect(page.pageCode).toBe(pageObject);
    expect(page.title).toBe("HomePage");
  });

  test("page object generated with ciryllic title", () => {
    const page = pageObjectTemplate([], { host: "jdi - testing.github.io" }, "Домашняя страница");
    expect(page.pageCode).toBe(pageObjectCiryllic);
    expect(page.title).toBe("DomashnyayaStranitsaPage");
  });
});

// describe("create locators names", () => {

// });


