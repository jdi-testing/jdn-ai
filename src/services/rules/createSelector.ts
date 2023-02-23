import { Rule, SelectorsMap } from "./rules.types";
import { VueRules } from "./Vue.rules";

export const createSelector = (rules: Rule, excludingRules?: Rule) => {
  let selector = "";

  selector = `${selector}${rules.tag || ""}`;

  if (rules.selector) selector = `${selector}${rules.selector}`;

  if (rules.classes)
    rules.classes.forEach((_class) => {
      selector = `${selector}.${_class}`;
    });

  if (rules.children) {
    rules.children.forEach((_childRule) => {
      selector = `${selector}:has(${createSelector(_childRule)})`;
    });
  }

  const createNegativeSelector = (_selector: string, _excludingRules: Rule, isChild?: boolean) => {
    const childStart = isChild ? ":has(" : "";
    const childEnd = isChild ? ")" : "";

    if (_excludingRules.tag) {
      _selector = `${_selector}:not(${childStart}${_excludingRules.tag}${childEnd})`;
    }

    if (_excludingRules.classes) {
      _excludingRules.classes.forEach((excludingClass) => {
        _selector = `${_selector}:not(${childStart}[class*='${excludingClass}']${childEnd})`;
      });
    }

    if (_excludingRules.children) {
      _excludingRules.children.forEach((_excludingChild) => {
        _selector = createNegativeSelector(_selector, _excludingChild, true);
      });
    }
    return _selector;
  };

  if (excludingRules) selector = createNegativeSelector(selector, excludingRules);

  return selector;
};

export const getLibrarySelectors = (rules: typeof VueRules) => {
  const selectors: SelectorsMap = {};
  rules.forEach(
    ({ jdnLabel, rules, excludingRules, ...rest }) =>
      (selectors[jdnLabel] = { selector: createSelector(rules, excludingRules), ...rest })
  );
  return selectors;
};
