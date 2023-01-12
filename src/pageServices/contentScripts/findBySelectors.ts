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
    elements.forEach((elem) => {
      elem.setAttribute(JDN_LABEL, jdnLabel);
      if (!elem.getAttribute(JDN_HASH)) elem.setAttribute(JDN_HASH, gen_uuid());
    });
  };

  const cleanUpContent = (elements: NodeListOf<Element>, selectorsMap: SelectorsMap) => {
    const elementsSet = new Set(Array.from(elements));
    Array.from(elements).forEach((_elem) => {
      const label = _elem.getAttribute(JDN_LABEL) as JDNLabel;
      if (!selectorsMap[label]?.detectContent) {
        const content = _elem.querySelectorAll(`[${JDN_LABEL}]`);
        content.forEach((_content) => elementsSet.delete(_content));
      }
    })
    return Array.from(elementsSet);
  };

  const findElements = async (selectorsMap: SelectorsMap, callback: (arr: any[]) => void) => {
    Object.entries(selectorsMap).forEach(([jdnLabel, { selector, detectContent }]) =>
      markupElements(document.querySelectorAll(selector), jdnLabel as JDNLabel)
    );
    callback(
      cleanUpContent(document.querySelectorAll(`[${JDN_LABEL}]`), selectorsMap).map((_elem) => ({
        element_id: _elem.getAttribute(JDN_HASH),
        predicted_label: _elem.getAttribute(JDN_LABEL),
      }))
    );
    removeLabels();
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
