export const getGenerationAttributes = () => {
  /*
    Make an 'ID' attribute to the camel notation. Rules:
    - Replace the dash just before the letters (search-button -> searchButton)
    - Before the numbers, replace a dash into an underline (ma-0-6 -> ma_0_6)
    - Otherwise, leave it as it is (searchButton -> searchButton)
  */
  const camelCase = (string) => {
    if (string.indexOf("-") < 0 && string.indexOf("_") < 0) {
      return string;
    }
    const regex = /(_|-)([a-z])/g;
    const toCamelCase = (string) => string[1].toUpperCase();
    return string
      .toLowerCase()
      .replace(regex, toCamelCase)
      .replaceAll("-", "_");
  };

  const mapElements = (elements) => {
    const generationAttributes = (elements.map((predictedElement) => {
      let element = document.querySelector(
        `[jdn-hash='${predictedElement.element_id}']`
      );
      if (!element) {
        return;
      }
      predictedElement.attrId = element.id;
      predictedElement.predictedAttrId = element.id
        ? camelCase(element.id)
        : "";
      predictedElement.tagName = element.tagName.toLowerCase();

      return {
        ...predictedElement,
      };
    })).filter(el => !!el);
    return generationAttributes;
  };

  chrome.runtime.onMessage.addListener(({ message, param }, sender, sendResponse) => {
    if (message === "GENERATE_ATTRIBUTES") {
      sendResponse(mapElements(param));
    }

    if (message === "PING_SCRIPT" && (param.scriptName === "generateXpathes")) {
      sendResponse({ message: true });
    }
  });
};
