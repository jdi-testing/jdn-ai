import { filter, replace } from "lodash";
import { saveAs } from "file-saver";

import { connector } from "./connector";
import { getJDILabel } from "../utils/generationClassesMap";
import { locatorTaskStatus } from "../utils/constants";
import { openDownloadPopup } from "./pageDataHandlers";
import { pageObjectTemplate } from "./pageObjectTemplate";
import javaReservedWords from "../utils/javaReservedWords.json";

export const isStringMatchesReservedWord = (string) => javaReservedWords.includes(string);

export const getLocator = ({ fullXpath, robulaXpath, customXpath }) => {
  return customXpath || robulaXpath || fullXpath || "";
};

export const isNameUnique = (elements, element_id, newName) =>
  !elements.find((elem) => elem.name === newName && elem.element_id !== element_id);

export const createLocatorNames = (elements) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames = [];

  const getElementName = (element) => {
    const jdiLabel = getJDILabel(element.predicted_label).toLowerCase();
    return element.tagName === "a" || jdiLabel === element.tagName.toLowerCase() ?
      jdiLabel :
      jdiLabel + element.tagName[0].toUpperCase() + element.tagName.slice(1);
  };

  return f.map((e, i) => {
    let elementName = getElementName(e);
    let elementTagId = replace(e.predictedAttrId, new RegExp(" ", "g"), "");

    const startsWithNumber = new RegExp("^[0-9].+$");
    elementTagId = elementTagId.match(startsWithNumber) ? `name${elementTagId}` : elementTagId;

    if (uniqueNames.indexOf(elementName) >= 0) elementName += i;
    if (elementTagId && uniqueNames.indexOf(elementTagId) >= 0) elementTagId += i;
    uniqueNames.push(elementTagId, elementName);

    const name = e.isCustomName ? e.name : elementTagId || elementName;

    const type = getJDILabel(e.predicted_label);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const getPageTitle = async () => {
  return await connector.attachContentScript(() => {
    return document.title;
  });
};

export const getPage = async (locators) => {
  const location = await connector.attachContentScript(() => {
    const { hostname, pathname, origin, host } = document.location;
    return { hostname, pathname, origin, host };
  });

  const title = await getPageTitle();

  const pageObject = pageObjectTemplate(locators, location[0].result, title[0].result);
  return pageObject;
};

export const generatePageObject = async (elements) => {
  const page = await getPage(elements);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};

const hasNotGeneratedLocators = (locators) =>
  locators.some((loc) => {
    return loc.locator.taskStatus === locatorTaskStatus.STARTED || loc.locator.taskStatus === locatorTaskStatus.PENDING;
  });

export const generateAllLocators = (locators) => generatePageObject(filter(locators, (loc) => !loc.deleted));

export const generateAndDownload = (locators) => {
  if (hasNotGeneratedLocators(locators)) {
    openDownloadPopup();
  } else {
    generateAllLocators(locators);
  }
};
