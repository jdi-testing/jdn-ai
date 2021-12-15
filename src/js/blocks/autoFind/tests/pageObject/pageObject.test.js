import { pageObjectTemplate } from "../../utils/pageObjectTemplate";
import { locators, pageObject, pageObjectCiryllic } from "./pageObject.mock";


test("page object generated", () => {
  const string = pageObjectTemplate(locators, { host: "jdi - testing.github.io" }, "Home Page");
  expect(string).toBe(pageObject);
});

test("page object generated with ciryllic title", () => {
  const string = pageObjectTemplate([], { host: "jdi - testing.github.io" }, "Домашняя страница");
  expect(string).toBe(pageObjectCiryllic);
});
