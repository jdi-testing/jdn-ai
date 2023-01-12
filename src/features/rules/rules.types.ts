import { VuetifyClasses } from "../pageObjects/utils/generationClassesMap";

export type JDNLabel = keyof typeof VuetifyClasses;

export interface RulesMap {
  jdnLabel: JDNLabel;
  // attributes of an Element to recognize
  rules: Rule;
  // to detect elements that are inside other elements
  detectContent?: boolean;
  // to resolve conflict if one element is predicted with mwny different classes
  priority?: "normal" | "low";
}

export interface Rule {
  tag?: string;
  classes?: string[];
}

export type SelectorsMap = Partial<
  Record<JDNLabel, { selector: string; detectContent?: boolean; priority?: RulesMap["priority"] }>
>;
