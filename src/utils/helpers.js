import { getLocator } from "../services/pageObject";

export const floatToPercent = (value) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, '\\n');
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (loc) => `@UI("${getLocator(loc.locator)}")\npublic ${loc.type} ${loc.name};`;

export const convertListToTree = (list) => {
  let map = {};
  let tree = [];

  for (let i = 0; i < list.length; i++) {
    map[list[i].element_id] = i;
    list[i].children = [];
  }
  
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== "") {
      list[map[node.parent_id]]?.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};
