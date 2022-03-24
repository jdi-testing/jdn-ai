import { replace, size } from "lodash";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { connector } from "./connector";
import { getJDILabel } from "../utils/generationClassesMap";
import { pageObjectTemplate } from "./pageObjectTemplate";
import javaReservedWords from "../utils/javaReservedWords.json";
import { selectConfirmedLocators, selectPageObjects } from "../store/selectors/pageObjectSelectors";

export const isStringMatchesReservedWord = (string) => javaReservedWords.includes(string);

export const getLocator = ({ fullXpath, robulaXpath, customXpath }) => {
  return customXpath || robulaXpath || fullXpath || "";
};

export const isNameUnique = (elements, element_id, newName) =>
  !elements.find((elem) => elem.name === newName && elem.element_id !== element_id);

export const isPONameUnique = (elements, id, newName) =>
  !elements.find((elem) => elem.name === newName && elem.id !== id);

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

export const getPageAttributes = async () => {
  return await connector.attachContentScript(() => {
    const {title, URL} = document;
    return {title, url: URL};
  });
};

export const getPage = async (locators, title) => {
  const location = await connector.attachContentScript(() => {
    const { hostname, pathname, origin, host } = document.location;
    return { hostname, pathname, origin, host };
  });

  const pageObject = pageObjectTemplate(locators, location[0].result, title);
  return pageObject;
};

export const generatePageObject = async (elements, title) => {
  const page = await getPage(elements, title);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};

export const generateAndDownloadZip = async (state) => {
  const zip = new JSZip();

  const pageObjects = selectPageObjects(state);

  for (const po of pageObjects) {
    const locators = selectConfirmedLocators(state, po.id);
    if (!size(locators)) continue;
    const page = await getPage(locators, po.name);
    zip.file(`${page.title}.java`, page.pageCode, {binary: true});
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "pageObjects.zip");
};
