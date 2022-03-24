import CyrillicToTranslit from "cyrillic-to-translit-js";
import { getLocator } from "./pageObject";

export function camelCase(n) {
  let name = "";
  if (n) {
    const arrayName = n.split(/[^a-zA-Zа-яёА-ЯЁ0-9_$]/);
    for (let j = 0; j < arrayName.length; j++) {
      if (arrayName[j]) {
        name += arrayName[j][0].toUpperCase() + arrayName[j].slice(1);
      }
    }
  }
  return name;
}

export const getClassName = (title) => {
  let className = camelCase(title);

  const isCyrillic = (term) => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    return cyrillicPattern.test(term);
  };

  if (isCyrillic(className)) {
    // eslint-disable-next-line new-cap
    className = CyrillicToTranslit().transform(className, " ");
  }
  if (className.length > 4 && className.substr(-4).toLowerCase() !== "page") className += "Page";
  return className;
};

export const pageObjectTemplate = (locators, { host }, title) => {
  const sitePackage = host ?
    host
        .split(".")
        .reverse()
        .map((e) => e.replace(/[^a-zA-Z0-9]+/g, ""))
        .join(".") :
    "";

  const className = getClassName(title);
  const locatorsCode = locators.map((loc) => `    @UI("${getLocator(loc.locator)}") public ${loc.type} ${loc.name};`);

  const pageCode = `package ${sitePackage}.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import ${sitePackage}.sections.*;

public class ${className} extends WebPage {
${locatorsCode.join("\n")}
}
`;

  return { pageCode, title: className };
};
