import { Rule, SelectorsMap } from "./rules.types";
import { VueRules } from "./Vue.rules";

export const createSelector = (rules: Rule) => {
  let selector = "";

  selector = `${selector}${rules.tag || ""}`;
  if (rules.classes) rules.classes.forEach((_class) => (selector = `${selector}.${_class}`));

  return selector;
};

export const getLibrarySelectors = () => {
  const selectors: SelectorsMap = {};
  VueRules.forEach(
    ({ jdnLabel, rules, ...rest }) => (selectors[jdnLabel] = { selector: createSelector(rules), ...rest })
  );
  return selectors;
};
