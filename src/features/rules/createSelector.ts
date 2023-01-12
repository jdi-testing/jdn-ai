import { Rule, SelectorsMap } from "./rules.types";
import { VueRules } from "./Vue.rules";

export const createSelector = (rules: Rule) => {
  let selector = "";

  selector = `${selector}${rules.tag}`;
  rules.classes.forEach((_class) => (selector = `${selector}.${_class}`));

  return selector;
};

export const getLibrarySelectors = () => {
  const selectors: SelectorsMap = {};
  VueRules.forEach(({ jdnLabel, rules, detectContent }) => selectors[jdnLabel] = { selector: createSelector(rules), detectContent });
  return selectors;
};
