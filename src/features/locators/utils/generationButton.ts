import { sendMessage } from "../../../pageServices/connector";
import { getLibrarySelectors } from "../../../services/rules/createSelector";
import { VueRules } from "../../../services/rules/Vue.rules";

/* Runs elements identification based on algoritmic rules */
export const findByRules = () => {
  const selectors = getLibrarySelectors(VueRules);
  return sendMessage
    .findBySelectors(selectors)
    .then((result) => ({ data: result }))
    .catch((err) => console.log(err));
};
