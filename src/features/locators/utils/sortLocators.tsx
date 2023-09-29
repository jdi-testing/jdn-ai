import { ElementId, ILocator } from '../types/locator.types';

export const sortLocatorsWithChildren = (locators: ILocator[]) => {
  const childrenMap: Map<string, ILocator> = new Map();

  for (const locator of locators) {
    if (locator.parent_id) {
      childrenMap.set(locator.element_id, locator);
    }
  }

  const sorted: ILocator[] = [];

  const addLocators = (_locators: ILocator[] | ElementId[]) => {
    for (let locator of _locators) {
      if (typeof locator === 'string') {
        if (!childrenMap.has(locator)) continue;
        locator = childrenMap.get(locator) as ILocator;
      } else if (locator.parent_id?.length && !childrenMap.has(locator.element_id)) continue;

      sorted.push(locator);
      childrenMap.delete(locator.element_id);

      if (locator.children?.length) addLocators(locator.children);
    }
  };

  addLocators(locators);
  return sorted;
};
