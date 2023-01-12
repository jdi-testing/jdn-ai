import { VuetifyClasses } from "../pageObjects/utils/generationClassesMap";

export type JDNLabel = keyof typeof VuetifyClasses;

export interface RulesMap {
  jdnLabel: JDNLabel;
  rules: Rule;
  detectContent?: boolean;
}

export interface Rule {
  tag?: string;
  classes?: string[];
}

export type SelectorsMap = Partial<Record<JDNLabel, {selector: string, detectContent?: boolean}>>;