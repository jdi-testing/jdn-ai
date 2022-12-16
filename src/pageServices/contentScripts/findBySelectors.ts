import { JDNLabel, SelectorsMap } from "../../features/rules/rules.types";

export const findBySelectors = () => {
  console.log("findBySelectors added");

  const JDN_HASH = "jdn-hash";
  const JDN_LABEL = "jdn-label";

  const gen_uuid = () =>
    Math.random().toString().substring(2, 12) +
    Date.now().toString().substring(5) +
    Math.random().toString().substring(2, 12);

  const removeLabels = () => {
    const elements = document.querySelectorAll(`[${JDN_LABEL}]`);
    elements.forEach((_elem) => _elem.removeAttribute(JDN_LABEL));
  };

  const markupElements = (elements: NodeListOf<Element>, jdnLabel: JDNLabel) => {
    removeLabels();
    return elements.forEach((elem) => {
      elem.setAttribute(JDN_LABEL, jdnLabel);
      if (!elem.getAttribute(JDN_HASH)) elem.setAttribute(JDN_HASH, gen_uuid());
    });
  };

  const findElements = async (selectorsMap: SelectorsMap[], callback: (arr: any[]) => void) => {
    selectorsMap.forEach(({ jdnLabel, selector }) => markupElements(document.querySelectorAll(selector), jdnLabel));
    callback(
      Array.from(document.querySelectorAll(`[${JDN_LABEL}]`)).map((_elem) => ({
        element_id: _elem.getAttribute(JDN_HASH),
        predicted_label: _elem.getAttribute(JDN_LABEL),
      }))
    );
  };

  const messageHandler = (
    { message, param }: { message: string; param: any },
    _: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) => {
    switch (message) {
      case "FIND_BY_SELECTORS":
        findElements(param, sendResponse);
        break;

      default:
        break;
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);
};
