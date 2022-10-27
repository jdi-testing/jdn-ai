import { cloneDeep, size, map as mapFunction } from "lodash";
import { Locator } from "../../../store/slices/locatorSlice.types";
import { getLocator } from "../Locator/utils";
import { SearchState } from "./LocatorsTree";

export const includesSeacrSubstr = (strings: Array<string>, searchString: string) => {
  const includesSubstring = strings.filter((string) => {
    return string && string.toLowerCase().includes(searchString.toLowerCase());
  });
  return !!size(includesSubstring);
};

export const applySearch = (element: Locator, seacrhString: string): SearchState => {
  const { locator, type, name } = element;
  if (includesSeacrSubstr([getLocator(locator), type as string, name], seacrhString)) {
    return SearchState.None;
  } else return SearchState.Hidden;
};

export interface LocatorTree extends Omit<Locator, "children"> {
  children?: Array<LocatorTree>;
}

export const convertListToTree = (_list: Array<Locator>) => {
  const list: Array<LocatorTree> = mapFunction(cloneDeep(_list), (elem) => ({ ...elem, children: [] }));
  const map: Record<string, number> = {};
  const tree = [];

  for (let i = 0; i < list.length; i++) {
    map[list[i].jdnHash] = i;
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== "") {
      const children = list[map[node.parent_id]]?.children;
      children && children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
};
