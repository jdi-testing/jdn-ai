import connector, { sendMessage } from "../../../pageServices/connector";
import { findBySelectors } from "../../../pageServices/contentScripts/findBySelectors";
import { getLibrarySelectors } from "../../../services/rules/createSelector";
import { VueRules } from "../../../services/rules/Vue.rules";

export const findByRules = () => {
  const selectors = getLibrarySelectors(VueRules);
  return connector
    .attachContentScript(findBySelectors)
    .then(() => {
      return sendMessage.findBySelectors(selectors);
    })
    .then((result) => ({ data: result }))
    .catch((err) => console.log(err));
};
