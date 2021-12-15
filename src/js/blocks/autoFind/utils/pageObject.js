import { camelCase } from "../../../models/GenerateBlockModel";
import { getJDILabel } from "./generationClassesMap";
import { connector } from "./connector";
import { pageObjectTemplate } from "./pageObjectTemplate";

const getPackage = (url) => {
  const urlObject = new URL(url);
  return urlObject.hostname
      .split(".")
      .reverse()
      .map((e) => e.replace(/[^a-zA-Z0-9]+/g, ""))
      .join(".");
};

export const getLocator = ({fullXpath, robulaXpath, customXpath}) => {
  return customXpath || robulaXpath || fullXpath || '';
};

export const createLocatorNames = (elements) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames = [];

  const getElementName = (element) => {
    const jdiLabel = getJDILabel(element.predicted_label).toLowerCase();
    return element.tagName === 'a' || jdiLabel === element.tagName.toLowerCase() ?
      jdiLabel :
      jdiLabel + element.tagName[0].toUpperCase() + element.tagName.slice(1);
  };

  return f.map((e, i) => {
    let elementName = getElementName(e);
    let elementTagId = e.predictedAttrId.replaceAll(" ", "");

    const startsWithNumber = new RegExp('^[0-9].+$');
    elementTagId = elementTagId.match(startsWithNumber) ? `name${elementTagId}` : elementTagId;

    if (uniqueNames.indexOf(elementName) >= 0) elementName += i;
    if (elementTagId && uniqueNames.indexOf(elementTagId) >= 0) elementTagId += i;
    uniqueNames.push(elementTagId, elementName);

    const name = e.isCustomName ?
      e.name :
      elementTagId ?
        elementTagId :
        elementName;

    const type = getJDILabel(e.predicted_label);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const predictedToConvert = (elements) => {
  return elements.map((e) => {
    return {
      ...e,
      Locator: getLocator(e.locator),
      Name: e.name,
      Type: e.type,
      parent: null,
      parentId: null,
      elId: e.element_id,
    };
  });
};

export const getPage = (elToConvert, callback) => {
  callback({
    elements: elToConvert,
    name: camelCase(connector.tab.title),
    package: getPackage(connector.tab.url),
  });
};

export const generatePageObject = (elements, mainModel) => {
  const elToConvert = predictedToConvert(elements);
  getPage(elToConvert, (page) => {
    mainModel.conversionModel.genPageCode(page, mainModel, true);
    mainModel.conversionModel.downloadPageCode(page, ".java");
  });
};

export const _generatePageObject = async (locators) => {
  const location = await connector.attachContentScript(() => {
    const {hostname, pathname, origin, host} = document.location;
    return {hostname, pathname, origin, host};
  });

  const title = await connector.attachContentScript(() => {
    return document.title;
  });

  const pageObject = pageObjectTemplate(locators, location[0].result, title[0].result);
  return pageObject;
};
