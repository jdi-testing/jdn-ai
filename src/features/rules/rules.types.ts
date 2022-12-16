import { ElementLabel, VuetifyClasses } from "../pageObjects/utils/generationClassesMap";

export type JDNLabel = keyof typeof VuetifyClasses;

export interface RulesMap {
    jdnLabel: JDNLabel,
    rules: Rule,
}

export interface Rule {
    tag: string,
    classes: string[],
}

export interface SelectorsMap {
    jdnLabel: JDNLabel,
    selector: string,
}
