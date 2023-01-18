import { Rule, SelectorsMap } from "./rules.types";
import { VueRules } from "./Vue.rules";

export const createSelector = (rules: Rule) => {
    let selector = "";

  selector = `${selector}${rules.tag || ""}`;
  if (rules.classes)
    rules.classes.forEach((_class) => {
      selector = `${selector}.${_class}`;
      if (rules.children) {
        rules.children.forEach((_childRule) => {
          selector = `${selector}:has(${createSelector(_childRule)})`;
        });
      }
    });

  return selector;
};

export const getLibrarySelectors = (rules: typeof VueRules) => {
  const selectors: SelectorsMap = {};
  rules.forEach(
    ({ jdnLabel, rules, ...rest }) => (selectors[jdnLabel] = { selector: createSelector(rules), ...rest })
  );
  return selectors;
};
