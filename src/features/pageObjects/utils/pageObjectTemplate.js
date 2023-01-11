import CyrillicToTranslit from "cyrillic-to-translit-js";
import { getLocator } from "../../../features/locators/locator/utils";
import { ElementLibrary } from "./generationClassesMap";

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

  const classNameArr = className.split(/(?=[A-Z])/);
  if (Number(classNameArr[0])) {
    classNameArr.shift();
    className = classNameArr.join("");
  }

  const isCyrillic = (term) => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    return cyrillicPattern.test(term);
  };

  if (isCyrillic(className)) {
    // eslint-disable-next-line new-cap
    className = CyrillicToTranslit().transform(className, " ");
  }
  if (className.length > 56) className = className.slice(0, 55);
  if (className.length > 4 && className.substr(-4).toLowerCase() !== "page") className += "Page";
  return className;
};

export const pageObjectTemplate = (locators, title, libraries) => {
  const className = title;
  const locatorsCode = locators.map(
    (loc) => `    @UI("${getLocator(loc.locator)}")\n    public ${loc.type} ${loc.name};`
  );

  const pageCode = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
${
  libraries.includes(ElementLibrary.HTML5)
    ? `
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;`
    : ""
}${
    libraries.includes(ElementLibrary.MUI)
      ? `
import com.epam.jdi.light.material.elements.displaydata.*;
import com.epam.jdi.light.material.elements.displaydata.table.*;
import com.epam.jdi.light.material.elements.feedback.*;
import com.epam.jdi.light.material.elements.feedback.progress.*;
import com.epam.jdi.light.material.elements.inputs.*;
import com.epam.jdi.light.material.elements.inputs.transferlist.*;
import com.epam.jdi.light.material.elements.layout.*;
import com.epam.jdi.light.material.elements.navigation.*;
import com.epam.jdi.light.material.elements.navigation.steppers.*;
import com.epam.jdi.light.material.elements.surfaces.*;
import com.epam.jdi.light.material.elements.utils.*;`
      : ""
  }

public class ${className} extends WebPage {
${locatorsCode.join("\n\n")}
}
`;

  return { pageCode, title: className };
};
