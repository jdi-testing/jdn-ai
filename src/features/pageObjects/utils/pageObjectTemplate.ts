import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { camelCase, upperFirst } from "lodash";
import transliterate from "@sindresorhus/transliterate";
import { getLocator } from "../../locators/utils/utils";
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

export const pageObjectTemplate = (locators: Locator[], title: string, library: ElementLibrary) => {
  const className = title;
  const locatorsCode = locators.map(
    (loc) => `    @UI("${getLocator(loc.locator)}")\n    public ${loc.type} ${loc.name};`
  );

  const pageCode = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
${
  library === ElementLibrary.MUI
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
import com.epam.jdi.light.material.elements.utils.*;
`
    : ""
}${
    library === ElementLibrary.Vuetify
      ? `
import com.epam.jdi.light.vuetify.elements.common.*;
import com.epam.jdi.light.vuetify.elements.complex.*;
import com.epam.jdi.light.vuetify.elements.complex.bars.*;
import com.epam.jdi.light.vuetify.elements.complex.breadcrumbs.*;
import com.epam.jdi.light.vuetify.elements.complex.panels.*;
import com.epam.jdi.light.vuetify.elements.complex.radiobuttons.*;
import com.epam.jdi.light.vuetify.elements.complex.stepper.*;
import com.epam.jdi.light.vuetify.elements.complex.tables.*;
import com.epam.jdi.light.vuetify.elements.complex.timelines.*;
import com.epam.jdi.light.vuetify.elements.composite.*;
`
      : ""
  }
public class ${className} extends WebPage {
${locatorsCode.join("\n\n")}
}
`;

  return { pageCode, title: className };
};
