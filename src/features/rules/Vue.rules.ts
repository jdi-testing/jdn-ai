import { RulesMap } from "./rules.types";

export const VueRules: RulesMap[] = [
  {
    jdnLabel: "button",
    rules: {
      tag: "button",
      classes: ["v-btn"],
    },
  },
  {
    jdnLabel: "icon",
    rules: {
      tag: "i",
      classes: ["v-icon"],
    }
  }
];
