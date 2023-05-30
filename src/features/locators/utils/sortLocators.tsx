import { ElementId, Locator } from "../types/locator.types";

export const sortLocatorsWithChildren = (locators: Array<Locator>) => {
  const childrenMap: Map<string, Locator> = new Map();

  for (const locator of locators) {
    if (locator.parent_id) {
      childrenMap.set(locator.element_id, locator);
    }
  }

  const sorted: Locator[] = [];

  const addLocators = (_locators: Locator[] | ElementId[]) => {
    for (let locator of _locators) {
      if (typeof locator === "string") {
        if (!childrenMap.has(locator)) continue;
        locator = childrenMap.get(locator) as Locator;
      } else if (locator.parent_id?.length && !childrenMap.has(locator.element_id)) continue;

      sorted.push(locator);
      childrenMap.delete(locator.element_id);

      if (locator.children?.length) addLocators(locator.children);
    }
  };

  addLocators(locators);
  return sorted as Locator[];
};
