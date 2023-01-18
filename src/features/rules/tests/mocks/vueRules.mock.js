import { VueRules } from "../../Vue.rules";

const exceptionClasses = ["dataTable", "datePicker", "datePickerMonth", "simpleTable"];

export const vueRulesMock = () => VueRules.filter((rule) => !exceptionClasses.includes(rule.jdnLabel));
