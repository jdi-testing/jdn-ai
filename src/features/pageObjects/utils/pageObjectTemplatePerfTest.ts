//import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { camelCase, upperFirst } from "lodash";
import transliterate from "@sindresorhus/transliterate";
import { Locator } from "../../locators/types/locator.types";

export const getClassName = (title: string) => {
  let className = transliterate(title);
  className = camelCase(className);

  className = className.substring(className.search(/[a-zA-Za]/)); // removing numbers in the start of string
  className = upperFirst(className); // we generate Java class name, so we always need a capital first letter

  if (className.length > 56) className = className.slice(0, 55);
  if (className.length > 4 && className.slice(-4).toLowerCase() !== "page") className += "Page";
  return className;
};

export const pageObjectTemplate = (locators: Locator[], title: string, url: string) => {
  const className = title;
  const pageUrl = url;
  const locatorsCode = locators.map((loc) => `    this.${loc.name} = new ${loc.type}("${loc.locator.output}", page)`);

  const pageCode = `const Page = require("../../core/page");
  const TextField = require("../../core/elements/textField");
  const Button = require("../../core/elements/button");
  const UploadField = require("../../core/elements/uploadField");
  const UIElement = require("../../core/elements/element");\n
class ${className} extends Page {\n
  constructor(page) {
    super(page)
    this.url = "${pageUrl}"
  }\n
  init(page){
    super.init(page)
${locatorsCode.join("\n")}
  }\n
}\n
module.exports = ${className};
`;

  return { pageCode, title: className };
};
