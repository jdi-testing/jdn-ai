import { cloneDeep, map as mapFunction, size } from 'lodash';
import { JDNHash, ILocator } from '../../locators/types/locator.types';
import { SearchState } from '../components/LocatorsTree';

export interface LocatorTree extends Omit<ILocator, 'children'> {
  children?: Array<LocatorTree>;
  depth?: number;
  searchState?: SearchState;
}

export const convertToListWithChildren = (_list: ILocator[]) => {
  const list = cloneDeep(_list);
  const map: Record<string, number> = {};

  for (let i = 0; i < list.length; i++) {
    map[list[i].jdnHash] = i;
    list[i].children = [];
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.parent_id !== '') {
      const children = list[map[node.parent_id]]?.children;
      children && children.push(node.element_id);
    }
  }

  return list;
};

export const includesSearchSubstr = (strings: Array<string | undefined>, searchString: string) => {
  const includesSubstring = strings.filter((string) => {
    return string && string.toLowerCase().includes(searchString.toLowerCase());
  });
  return !!size(includesSubstring);
};

export const applySearch = (element: ILocator, searchString: string): SearchState => {
  const { locatorValue, type, name, elemText } = element;
  if (
    includesSearchSubstr([locatorValue.output, type as string, name, ...(elemText ? [elemText] : [])], searchString)
  ) {
    return SearchState.None;
  } else return SearchState.Hidden;
};

export const convertListToTree = (_list: ILocator[], searchString = '') => {
  const list: Array<LocatorTree> = mapFunction(cloneDeep(_list), (elem) => ({
    ...elem,
    children: [],
    searchState: searchString.length ? applySearch(elem, searchString) : undefined,
    depth: !elem.parent_id.length ? 0 : undefined,
  }));
  const map: Record<JDNHash, number> = {};
  const tree = [];

  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    map[element.jdnHash] = i;
  }

  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    const searchState = node.searchState;
    if (node.parent_id !== '') {
      if (searchState === SearchState.Hidden) continue;

      const getParent = (parent_id: string): LocatorTree => {
        const parent = list[map[parent_id]];
        if (parent?.depth === undefined) parent.depth = (list[map[parent?.parent_id]]?.depth || 0) + 1;
        if (parent?.searchState === SearchState.Hidden && parent.parent_id.length) return getParent(parent.parent_id);
        else return parent;
      };

      const treeParent = getParent(node.parent_id);
      const origDepth = (list[map[node.parent_id]].depth || 0) + 1;
      const children = treeParent.children;

      if (children) {
        children.push({ ...node, depth: origDepth });
      }
    } else {
      tree.push({ ...node, searchState });
    }
  }

  return tree.filter((treeElement) => treeElement.children?.length || treeElement.searchState !== SearchState.Hidden);
};

export const setNewParents = (origLocators: ILocator[], filteredLocators: ILocator[]) => {
  const origMap: Record<string, ILocator> = {};
  const filteredMap: Record<string, ILocator> = {};
  const newLocators: Array<ILocator> = [];

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
    if (parent_id === '' || filteredMap[parent_id] !== undefined) {
      newLocators.push(newElement);
      return;
    }

    do {
      parent_id = origMap[parent_id].parent_id;
      newElement.parent_id = parent_id !== '' ? filteredMap[parent_id]?.jdnHash : '';
    } while (newElement.parent_id === undefined);

    newLocators.push(newElement);
  });

  return convertToListWithChildren(newLocators);
};
