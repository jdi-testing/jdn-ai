import { VuetifyClasses } from "../../features/locators/types/generationClassesMap";

export type JDNLabel = keyof typeof VuetifyClasses;

export interface RulesMap {
  jdnLabel: JDNLabel;
  // attributes of an Element to recognize
  rules: Rule;
  // to detect elements that are inside other elements
  detectContent?: boolean;
  // to resolve conflict if one element is predicted with mwny different classes
  priority?: "high" | "normal" | "low";
}

export interface Rule {
  tag?: string;
  classes?: string[];
  excludeClasses?: string[],
  // attributes?: [string, string][]; see DataTable and SimpleTable
  children?: Rule[];
}

export type SelectorsMap = Partial<
  Record<JDNLabel, { selector: string; detectContent?: boolean; priority?: RulesMap["priority"] }>
>;
