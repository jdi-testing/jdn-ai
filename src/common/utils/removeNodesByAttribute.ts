export const removeNodesByAttribute = (htmlString: string, attributeName: string, badValues: string[]): string => {
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlString, 'text/html');

  const elements = document.querySelectorAll(`[${attributeName}]`);

  elements.forEach((el) => {
    const attributeValue = el.getAttribute(attributeName)?.replace(/\D/g, '');
    if (attributeValue && badValues.includes(attributeValue)) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  });

  const res = document.documentElement.outerHTML.replace(/\\&quot;/g, '');
  return JSON.stringify(res);
};
