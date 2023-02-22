import { VueRules } from "../../../services/rules/Vue.rules";

const exceptionClasses = ["dataTable", "datePicker", "datePickerMonth", "simpleTable", "autocomplete", "select"];

export const vueRulesMock = () => VueRules.filter((rule) => !exceptionClasses.includes(rule.jdnLabel));
