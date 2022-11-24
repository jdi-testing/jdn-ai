import { cloneDeep, map as mapFunction, size } from "lodash";
import { convertToListWithChildren } from "../../../common/utils/helpers";
import { getLocator } from "../locator/utils";
import { Locator } from "../locatorSlice.types";
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
  depth?: number;
  searchState?: SearchState;
}

export const convertListToTree = (_list: Array<Locator>, searchString = "") => {
  const list: Array<LocatorTree> = mapFunction(cloneDeep(_list), (elem) => ({
    ...elem,
    children: [],
    searchState: searchString.length ? applySearch(elem, searchString) : undefined,
    depth: !elem.parent_id.length ? 0 : undefined,
  }));
  const map: Record<string, number> = {};
  const tree = [];

  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    map[element.jdnHash] = i;
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    const searchState = node.searchState;
    if (node.parent_id !== "") {
      if (searchState === SearchState.Hidden) continue;

      const getParent = (parent_id: string): LocatorTree => {
        const parent = list[map[parent_id]];
        if (parent.depth === undefined) parent.depth = (list[map[parent.parent_id]]?.depth || 0) + 1;
        if (parent.searchState === SearchState.Hidden && parent.parent_id.length) return getParent(parent.parent_id);
        else return parent;
      };

      const treeParent = getParent(node.parent_id);
      const origDepth = (list[map[node.parent_id]].depth || 0) + 1;
      const children = treeParent.children;
      children && children.push({ ...node, depth: origDepth });
    } else {
      tree.push({ ...node, searchState });
    }
  }

  return tree.filter((treeElement) => treeElement.children?.length || treeElement.searchState !== SearchState.Hidden);
};

export const setNewParents = (origLocators: Array<Locator>, filteredLocators: Array<Locator>) => {
  const origMap: Record<string, Locator> = {};
  const filteredMap: Record<string, Locator> = {};
  const newLocators: Array<Locator> = [];

  for (let i = 0; i < origLocators.length; i++) {
    const element = origLocators[i];
    origMap[element.jdnHash] = element;
  }

  filteredLocators.forEach((element) => {
    filteredMap[element.jdnHash] = element;
  });

  filteredLocators.forEach((element) => {
    let parent_id = element.parent_id;
    const newElement = { ...element };
    if (parent_id === "" || filteredMap[parent_id] !== undefined) {
      newLocators.push(newElement);
      return;
    }

    do {
      parent_id = origMap[parent_id].parent_id;
      newElement.parent_id = parent_id !== "" ? filteredMap[parent_id]?.jdnHash : "";
    } while (newElement.parent_id === undefined);

    newLocators.push(newElement);
  });

  return convertToListWithChildren(newLocators);
};
