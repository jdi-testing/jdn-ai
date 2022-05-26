import { cloneDeep } from "lodash";
import { getLocator } from "../services/pageObject";
import { VALIDATION_ERROR_TYPE } from "./constants";

export const floatToPercent = (value) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, '\\n');
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (loc) => `@UI("${getLocator(loc.locator)}")\npublic ${loc.type} ${loc.name};`;

export const convertListToTree = (_list) => {
  const list = cloneDeep(_list);
  const map = {};
  const tree = [];

  for (let i = 0; i < list.length; i++) {
    map[list[i].jdnHash] = i;
    list[i].children = [];
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== "") {
      list[map[node.parent_id]].children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};

export const convertToListWithChildren = (_list) => {
  const list = cloneDeep(_list);
  const map = {};

  for (let i = 0; i < list.length; i++) {
    map[list[i].jdnHash] = i;
    list[i].children = [];
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== "") {
      list[map[node.parent_id]].children.push(node.element_id);
    }
  }

  return list;
};

export const isErrorValidationType = (type) => VALIDATION_ERROR_TYPE.hasOwnProperty(type);
