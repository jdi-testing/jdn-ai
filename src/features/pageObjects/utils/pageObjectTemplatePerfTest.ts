import { Locator } from "../../locators/types/locator.types";

export const pageObjectTemplatePerfTest = (locators: Locator[], title: string, url: string) => {
  const locatorsCode = locators.map((loc) => `    this.${loc.name} = new ${loc.type}("${loc.locator.output}", page)`);

  const pageCode = `const Page = require("../../core/page");
  const TextField = require("../../core/elements/textField");
  const Button = require("../../core/elements/button");
  const UploadField = require("../../core/elements/uploadField");
  const UIElement = require("../../core/elements/element");\n
class ${title} extends Page {\n
  constructor(page) {
    super(page)
    this.url = "${url}"
  }\n
  init(page){
    super.init(page)
${locatorsCode.join("\n")}
  }\n
}\n
module.exports = ${title};
`;

  return { pageCode, title };
};
