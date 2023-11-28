import { ElementAttributes } from '../../common/types/common';
import { LocatorValidationWarnings } from '../../features/locators/types/locator.types';
import { ScriptMsg } from '../scriptMsg.constants';

export const evaluateXpath = ({ xPath, element_id, originJdnHash }: Record<string, string>) => {
  try {
    const nodeSnapshot = document.evaluate(xPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const length = nodeSnapshot.snapshotLength;
    const foundElement = nodeSnapshot.snapshotItem(0) as Element;
    const foundHash = foundElement && foundElement.getAttribute('jdn-hash');
    const foundElementText = foundElement && foundElement.textContent;
    return JSON.stringify({ length, foundHash, element_id, foundElementText, originJdnHash });
  } catch (error) {
    return LocatorValidationWarnings.NotFound;
  }
};

export const evaluateStandardLocator = ({
  selector,
  elementId,
  originJdnHash,
  isLinkTextLocator,
}: Record<string, string>) => {
  try {
    let foundElements;
    if (isLinkTextLocator) {
      foundElements = Array.from(document.querySelectorAll('a')).filter(
        (element) => element.textContent && element.textContent.includes(selector),
      );
    } else {
      foundElements = document.querySelectorAll(selector);
    }
    const length = foundElements.length;
    const foundHash = foundElements && foundElements[0].getAttribute('jdn-hash');
    const foundElementText = foundElements && foundElements[0].textContent;
    return JSON.stringify({ length, foundHash, elementId, foundElementText, originJdnHash });
  } catch (error) {
    return LocatorValidationWarnings.NotFound;
  }
};

export const assignJdnHash = ({
  locator,
  jdnHash,
  isCSSLocator,
}: {
  jdnHash: string;
  locator: string;
  isCSSLocator?: boolean;
}) => {
  try {
    let foundElement, length;
    if (isCSSLocator) {
      const foundElements = document.querySelectorAll(locator);
      foundElement = foundElements[0];
      length = foundElements.length;
    } else {
      const nodeSnapshot = document.evaluate(locator, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      length = nodeSnapshot.snapshotLength;
      foundElement = nodeSnapshot.snapshotItem(0) as Element;
    }
    if (length === 1) {
      foundElement.setAttribute('jdn-hash', jdnHash);
      return 'success';
    } else {
      return LocatorValidationWarnings.NotFound;
    }
  } catch (error) {
    return LocatorValidationWarnings.NotFound;
  }
};

export const utilityScript = () => {
  chrome.runtime.onMessage.addListener(({ message, param }, sender, sendResponse) => {
    switch (message) {
      case ScriptMsg.EvaluateXpath:
        sendResponse(evaluateXpath(param));
        break;
      case ScriptMsg.EvaluateStandardLocator:
        sendResponse(evaluateStandardLocator(param));
        break;
      case ScriptMsg.AssignJdnHash:
        sendResponse(assignJdnHash(param));
        break;
      default:
        break;
    }
  });
};

export const sendMessage = (msg: { message: ScriptMsg; param: any }) =>
  chrome.runtime.sendMessage(msg).catch((error) => {
    if (error.message !== 'The message port closed before a response was received.') throw new Error(error.message);
  });

export const getElementAttributes = (element: HTMLElement): ElementAttributes => {
  let attributes: ElementAttributes = {};

  if (element.id) {
    attributes.id = element.id;
  }
  // ignore for name attribute:
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (element.name) {
    attributes.name = element.getAttribute('name') ?? null;
  }

  if (element.innerText) {
    attributes.linkText = element.textContent?.trim();
  }

  if (element.tagName) {
    attributes.tagName = element.tagName.toLowerCase();
  }

  if (element.className) {
    attributes.className = element.className;
  }

  // Get data attributes
  const dataAttributes: { [key: string]: string } = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attribute = element.attributes[i];
    if (attribute.name.startsWith('data-')) {
      dataAttributes[attribute.name] = attribute.value;
    }
  }
  if (!!Object.keys(dataAttributes).length) attributes = { ...attributes, dataAttributes };

  return attributes;
};
