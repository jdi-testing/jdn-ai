import { ILocator } from "../../locators/types/locator.types";
import { PageObject } from "../types/pageObjectSlice.types";

export const pageObjectTemplatePerfTest = (
  locators: ILocator[],
  pageObject: PageObject
): { pageCode: string; name: string } => {
  const locatorsCode = locators.map((loc) => `    this.${loc.name} = new ${loc.type}("${loc.locator.output}", page)`);

  const pageCode = `const Page = require("../../core/page");
  const TextField = require("../../core/elements/textField");
  const Button = require("../../core/elements/button");
  const UploadField = require("../../core/elements/uploadField");
  const UIElement = require("../../core/elements/element");\n
class ${pageObject.name} extends Page {\n
  constructor(page) {
    super(page)
    this.url = "${pageObject.url}"
  }\n
  init(page){
    super.init(page)
${locatorsCode.join("\n")}
  }\n
}\n
module.exports = ${pageObject.name};
`;

  return { pageCode, name: pageObject.name };
};
