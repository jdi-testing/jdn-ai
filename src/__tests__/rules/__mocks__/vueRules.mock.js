import { VueRules } from "../../../services/rules/Vue.rules";

const exceptionClasses = ["dataTableV2", "dataTableV3", "datePicker", "datePickerMonth", "grid", "simpleTable"];

export const vueRulesMock = () => VueRules.filter((rule) => !exceptionClasses.includes(rule.jdnLabel));
