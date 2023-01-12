import { defaultClass } from "../../features/pageObjects/utils/generationClassesMap";
import { JDNLabel, RulesMap, SelectorsMap } from "../../features/rules/rules.types";

export const findBySelectors = () => {
  const JDN_HASH = "jdn-hash";
  const JDN_LABEL = "jdn-label";

  // elements with conflicted labels
  const conflictLabels: Element[] = [];

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
      let label = elem.getAttribute(JDN_LABEL);
      if (label) {
        conflictLabels.push(elem);
        label = `${label} ${jdnLabel}`;
      }
      elem.setAttribute(JDN_LABEL, label || jdnLabel);
      if (!elem.getAttribute(JDN_HASH)) elem.setAttribute(JDN_HASH, gen_uuid());
    });
  };

  const cleanUpContent = (elements: Element[], selectorsMap: SelectorsMap) => {
    const elementsSet = new Set(Array.from(elements));

    Array.from(elements).forEach((_elem) => {
      const label = _elem.getAttribute(JDN_LABEL) as JDNLabel;
      if (!selectorsMap[label]?.detectContent) {
        const content = _elem.querySelectorAll(`[${JDN_LABEL}]`);
        content.forEach((_content) => elementsSet.delete(_content));
      }
    });

    return Array.from(elementsSet);
  };

  const removeConflictedClasses = (elements: NodeListOf<Element>, selectorsMap: SelectorsMap) => {
    conflictLabels.forEach((_elem) => {
      const labels = _elem.getAttribute(JDN_LABEL)?.split(" ") || [];
      if (labels?.length > 1) {
        // @ts-ignore
        const prioritized: Partial<Record<RulesMap["priority"], JDNLabel>> = {};
        // @ts-ignore
        labels.forEach((_label) => (prioritized[selectorsMap[_label as JDNLabel]?.priority || "normal"] = _label));
        _elem.setAttribute(JDN_LABEL, prioritized.normal || prioritized.low || defaultClass);
      }
    });
    return Array.from(elements);
  };

  const findElements = async (selectorsMap: SelectorsMap, callback: (arr: any[]) => void) => {
    Object.entries(selectorsMap).forEach(([jdnLabel, { selector }]) =>
      markupElements(document.querySelectorAll(selector), jdnLabel as JDNLabel)
    );

    callback(
      cleanUpContent(
        removeConflictedClasses(document.querySelectorAll(`[${JDN_LABEL}]`), selectorsMap),
        selectorsMap
      ).map((_elem) => ({
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
