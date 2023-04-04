import { findSubstringWithinTerms } from "../../../common/utils/helpers";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { PageObject } from "../types/pageObjectSlice.types";

export const editPomContent = (content: string, po: PageObject): string => {
  let newContent = content;
  if (po.library === ElementLibrary.MUI && content.indexOf(`<!-- If you need Material UI library -->`) === -1) {
    const muiBlock = findSubstringWithinTerms(
      newContent,
      "<!-- If you need Material UI library",
      /<\/dependency>[\n\s\ta-zA-Z]*-->/
    );
    let newMuiBlock = muiBlock?.replace(
      `<!-- If you need Material UI library`,
      `<!-- If you need Material UI library -->`
    );
    newMuiBlock = newMuiBlock?.replace(
      /<\/dependency>[\n\s\ta-zA-Z]*-->/,
      `</dependency>\n        <!-- end for material ui -->`
    );
    newContent = newContent.replace(muiBlock, newMuiBlock);
  } else if (po.library === ElementLibrary.Vuetify) {
    const vuetifyBlock = findSubstringWithinTerms(
      newContent,
      "<!-- If you need Vuetify library",
      /<\/dependency>[\n\s\ta-zA-Z]*-->/
    );
    let newVuetifyBlock = vuetifyBlock?.replace(
      `<!-- If you need Vuetify library`,
      `<!-- If you need Vuetify library -->`
    );
    newVuetifyBlock = newVuetifyBlock?.replace(
      /<\/dependency>[\n\s\ta-zA-Z]*-->/,
      `</dependency>\n        <!-- end for Vuetify -->`
    );
    newContent = newContent.replace(vuetifyBlock, newVuetifyBlock);
  }

  return newContent;
};
