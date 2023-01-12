import { RulesMap } from "./rules.types";

export const VueRules: RulesMap[] = [
  {
    jdnLabel: "button",
    rules: {
      classes: ["v-btn"],
    },
  },
  {
    jdnLabel: "card",
    rules: {
      classes: ["v-card"],
    },
    detectContent: true,
  },
  {
    jdnLabel: "dataIterator",
    rules: {
      classes: ["v-data-iterator"],
    },
    detectContent: true,
  },
  {
    jdnLabel: "icon",
    rules: {
      classes: ["v-icon"],
    },
  },
  {
    jdnLabel: "sheet",
    rules: {
      classes: ["v-sheet"],
    },
    detectContent: true,
    priority: "low",
  },
];
