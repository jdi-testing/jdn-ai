import { camelCase } from "../../../models/GenerateBlockModel";
import { getJDILabel } from "./generationClassesMap";
import { connector } from "./connector";

const getPackage = (url) => {
  const urlObject = new URL(url);
  return urlObject.hostname
      .split(".")
      .reverse()
      .map((e) => e.replace(/[^a-zA-Z0-9]+/g, ""))
      .join(".");
};


export const predictedToConvert = (elements) => {
  const f = elements.filter((el) => el && !el.skipGeneration && !el.hidden);
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

    const customElementName = e.jdi_custom_class_name;

    if (uniqueNames.indexOf(elementName) >= 0) elementName += i;
    if (elementTagId && uniqueNames.indexOf(elementTagId) >= 0) elementTagId += i;
    uniqueNames.push(elementTagId, elementName);

    const name = customElementName ?
      customElementName :
      elementTagId ?
        elementTagId :
        elementName;

    return {
      ...e,
      Locator: e.xpath,
      Name: name,
      Type: getJDILabel(e.predicted_label),
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
