/*
    avoid using any outer scope variables inside this function
 */

import { ScriptMsg } from '../scriptMsg.constants';
import { assignJdnHash, getTaskStatus } from './utils';
import { LocatorElementStatus, LocatorTaskStatus } from '../../features/locators/types/locator.types';

const ADD_ELEMENT_TO_PO = 'To get data add element to Page Object';

///* global chrome */
export const highlightOnPage = () => {
  let port;
  let nodes = [];
  let predictedElements;
  let listenersAreSet;
  let scrollableContainers = [];
  let classFilter = {};
  let tooltip;
  let tooltipTimer;
  let coordinates = { x: 0, y: 0 };

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== 'The message port closed before a response was received.') throw new Error(error.message);
    });

  const clearState = () => {
    nodes = [];
    predictedElements = null;
    classFilter = null;
    scrollableContainers = [];
    tooltip = null;
  };

  const isInViewport = (elementRect) => {
    const { top, right, bottom, left } = elementRect;

    // at least a part of an element should be in the viewport
    return (
      ((top >= 0 && top <= window.innerHeight) || (bottom > 0 && bottom < window.innerHeight)) &&
      ((left >= 0 && left < window.innerWidth) || (right >= 0 && right < window.innerWidth))
    );
  };

  const isHiddenByOverflow = (element, elementRect) => {
    const container = scrollableContainers.find((_container) => _container.contains(element));

    if (!container) return false;

    const {
      top: containerTop,
      right: containerRight,
      bottom: containerBottom,
      left: containerLeft,
    } = container.getBoundingClientRect();

    const { top: elementTop, right: elementRight, bottom: elementBottom, left: elementLeft } = elementRect;

    return (
      elementTop > containerBottom ||
      elementBottom < containerTop ||
      elementLeft > containerRight ||
      elementRight < containerLeft
    );
  };

  const isFilteredOut = (type) => {
    return classFilter && Object.hasOwn(classFilter, type) && !classFilter[type];
  };

  const getClassName = (element) => {
    return `jdn-highlight ${element.isGenerated ? 'jdn-primary' : 'jdn-secondary'} ${
      element.active ? 'jdn-active' : ''
    }`;
  };

  const scrollToElement = (jdnHash) => {
    const originDiv = document.querySelector(`[jdn-hash='${jdnHash}']`);
    if (!originDiv) return;
    const originDivRect = originDiv.getBoundingClientRect();
    if (!isInViewport(originDivRect) || isHiddenByOverflow(originDiv, originDivRect)) {
      originDiv.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  const updateElement = (element) => {
    if (!predictedElements) return null;
    const i = predictedElements.findIndex((e) => e.elementId === element.elementId);
    predictedElements[i] = { ...predictedElements[i], ...element };
    const div = document.getElementById(predictedElements[i].jdnHash);
    return div;
  };

  const toggleElement = ({ element, skipScroll }) => {
    const div = updateElement(element);
    if (div) {
      div.className = getClassName(element);
    }
    if (!skipScroll && element.isGenerated) scrollToElement(element.jdnHash);
  };

  const toggleDeletedElement = (element) => {
    const div = updateElement(element);

    if (element.deleted) {
      if (div) {
        div.setAttribute('jdn-status', LocatorElementStatus.DELETED);
      }
    } else {
      const taskStatus = getTaskStatus(element.locatorValue.xPathStatus, element.locatorValue.cssSelectorStatus);
      div.setAttribute('jdn-status', taskStatus);
      findAndHighlight();
    }
    toggleElement({ element, skipScroll: true });
  };

  const removeElement = (element) => {
    const j = predictedElements.findIndex((e) => e.elementId === element?.elementId);
    if (j === -1) return;
    predictedElements.splice(j, 1);

    const div = document.getElementById(element?.jdnHash);
    if (div) div.remove();
  };

  const addHighlightElement = (element) => {
    if (!predictedElements) predictedElements = [element];
    else predictedElements.push(element);
    findAndHighlight();
  };

  const changeElementName = (element) => {
    const div = updateElement(element);
    div.querySelector('.jdn-class').textContent = element.name;
  };

  const updateTooltipXpath = (element) => {
    const taskStatus = getTaskStatus(element.locatorValue.xPathStatus, element.locatorValue.cssSelectorStatus);
    if (taskStatus === LocatorTaskStatus.SUCCESS && tooltip.getAttribute('jdn-element-hash') === element.elementId) {
      tooltip.querySelector('.jdn-tooltip-xpath').innerHTML = element.locatorValue.xPath;
    }
  };

  const changeGenerationStatus = (element) => {
    const div = updateElement(element);
    if (!div) return;
    const taskStatus = getTaskStatus(element.locatorValue.xPathStatus, element.locatorValue.cssSelectorStatus);
    div.setAttribute('jdn-status', taskStatus);
    updateTooltipXpath(element);
  };

  const setActiveElement = (element, toScroll) => {
    updateElement(element);
    if (toScroll) scrollToElement(element.jdnHash);
  };

  const toggleActiveGroup = (elements) => {
    elements.forEach((element) => updateElement(element));
    const active = elements.find(({ active }) => active);
    if (active) scrollToElement(active.jdnHash);
  };

  const drawRectangle = (elementRect, predictedElement) => {
    const { elementId, jdnHash } = predictedElement;
    const getDivPosition = (elementRect) => {
      const { top, left, height, width } = elementRect || {};

      return elementRect
        ? {
            left: `${left + window.pageXOffset + document.body.scrollLeft}px`,
            top: `${top + window.pageYOffset + document.body.scrollTop}px`,
            height: `${height}px`,
            width: `${width}px`,
          }
        : {};
    };
    const addTooltip = () => {
      if (tooltip) return;
      tooltip = document.createElement('div');
      tooltip.className = 'jdn-tooltip jdn-tooltip-hidden';
      document.body.appendChild(tooltip);
    };

    const tooltipDefaultStyle = ({ x, y }) => {
      const maxTooltipWidth = 400;
      const minTooltipHeight = 120;
      const xTooltipOffset = 18;
      const yTooltipOffset = 9;

      const clientWidth = document.body.clientWidth;
      const innerHeight = window.innerHeight;
      let right, left, top, bottom;
      let classNames = ['jdn-tooltip'];
      if (x + window.pageXOffset + (maxTooltipWidth - xTooltipOffset) > clientWidth) {
        right = `${clientWidth - x - window.pageXOffset - xTooltipOffset}px`;
        left = 'unset';
        classNames.push('jdn-tooltip-right');
      } else {
        left = `${x + window.pageXOffset - xTooltipOffset}px`;
        right = 'unset';
      }
      if (y + minTooltipHeight > window.innerHeight) {
        bottom = `${innerHeight - y - window.pageYOffset + yTooltipOffset}px`;
        top = 'unset';
        classNames.push('jdn-tooltip-top');
      } else {
        top = `${y + window.pageYOffset + yTooltipOffset}px`;
        bottom = 'unset';
      }
      return {
        style: { top, left, right, bottom },
        classNames,
      };
    };

    const tooltipInnerHTML = (el) => {
      return `
      <div class="jdn-tooltip-paragraph"><b>Name:</b> ${el.name}</div>
      <div class="jdn-tooltip-paragraph"><b>Type:</b> ${el.type}</div>
      <div class="jdn-tooltip-paragraph"><b>xPath:</b> <span class="jdn-tooltip-xpath">${
        el.locatorValue.xPath
      }</span></div>
      <div class="jdn-tooltip-paragraph"><b>CSS selector:</b> ${
        el.locatorValue.cssSelector ?? ADD_ELEMENT_TO_PO
      }</div>`;
    };

    const showTooltip = (event) => {
      const { x, y } = event;
      const { style, classNames } = tooltipDefaultStyle({ x, y });
      Object.assign(tooltip.style, style);
      const el = predictedElements.find((e) => e.elementId === elementId);
      tooltip.innerHTML = tooltipInnerHTML(el);
      tooltip.className = classNames.join(' ');
      tooltip.setAttribute('jdn-element-hash', el.elementId);
    };

    const predictedElementTaskStatus = getTaskStatus(
      predictedElement.locatorValue.xPathStatus,
      predictedElement.locatorValue.cssSelectorStatus,
    );
    const div = document.createElement('div');
    div.id = jdnHash;
    div.className = getClassName(predictedElement);
    div.setAttribute('jdn-highlight', true);
    div.setAttribute('jdn-status', predictedElementTaskStatus || LocatorTaskStatus.STARTED);
    div.addEventListener('mouseover', () => {
      tooltipTimer = setTimeout(() => {
        showTooltip(coordinates);
      }, 2000);
    });
    div.addEventListener('mouseout', () => {
      clearTimeout(tooltipTimer);
      tooltip.className = 'jdn-tooltip jdn-tooltip-hidden';
    });

    const label = document.createElement('span');
    label.className = 'jdn-label';
    label.innerHTML = `<span class="jdn-class">${predictedElement.name}</span>`;

    addTooltip();
    label.addEventListener('click', (event) => {
      event.stopPropagation();
      showTooltip(event);
    });

    Object.assign(div.style, getDivPosition(elementRect));
    div.insertAdjacentElement('afterBegin', label);

    document.body.appendChild(div);
  };

  const clearContainer = (container) => {
    nodes.forEach((node) => {
      if (container.contains(node)) {
        const jdnHash = node.getAttribute('jdn-hash');
        const div = document.getElementById(jdnHash);
        if (div) div.remove();
      }
    });
  };

  const findByHash = (jdnHash) => document.querySelector(`[jdn-hash='${jdnHash}']`);

  const findAndHighlight = (param) => {
    if (param) {
      if (!predictedElements) predictedElements = param.elements;
    }
    if (param?.filter) classFilter = param.filter;

    nodes = [];
    predictedElements.forEach(({ deleted, type, jdnHash, locatorValue }) => {
      if (deleted || isFilteredOut(type)) return;
      let node = findByHash(jdnHash);
      if (!node) {
        const isHashAssigned = assignJdnHash({ locatorValue: locatorValue.xPath, jdnHash }) === 'success';
        if (isHashAssigned) node = findByHash(jdnHash);
      }
      if (!node) return; // for now we don't know cases that would lead to this
      nodes.push(node);
    });

    nodes.forEach((element) => {
      const elementRect = element.getBoundingClientRect();
      if (isInViewport(elementRect) && !isHiddenByOverflow(element, elementRect)) {
        const hash = element.getAttribute('jdn-hash');
        const highlightElement = document.getElementById(hash);
        const predicted = predictedElements.find((e) => e.jdnHash === hash);
        if (!highlightElement) {
          drawRectangle(elementRect, predicted);
        } else {
          const highlightElementRect = highlightElement.getBoundingClientRect();
          if (JSON.stringify(elementRect) !== JSON.stringify(highlightElementRect)) {
            highlightElement.remove();
            drawRectangle(elementRect, predicted);
          }
        }
      }
    });
    chrome.storage.local.set({ JDN_HIGHLIGHT_IS_SET: { hash: Date.now() } });
  };

  let timer;
  const scrollListenerCallback = ({ target }) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (scrollableContainers.includes(target)) {
        clearContainer(target);
      }
      findAndHighlight();
    }, 300);
  };

  const removeTooltip = () => {
    const tooltip = document.querySelector('.jdn-tooltip');
    if (tooltip) tooltip.remove();
  };

  const removeHighlightElements = (callback) => {
    removeTooltip();
    if (predictedElements) {
      predictedElements.forEach(({ jdnHash }) => {
        const el = document.getElementById(jdnHash);
        if (el) el.remove();
      });
      clearState();
      callback();
    }
  };

  const onMouseMove = (event) => {
    const { x, y } = event;
    coordinates = { x, y };
  };

  const events = ['scroll', 'resize'];
  const removeEventListeners = () => {
    events.forEach((eventName) => {
      document.removeEventListener(eventName, scrollListenerCallback, true);
    });

    document.removeEventListener('dblclick', onElementDblClick);
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('mousemove', onMouseMove);

    listenersAreSet = false;
  };

  const removeHighlight = (callback) => () => {
    removeEventListeners(removeHighlightElements(callback));
  };

  const onElementDblClick = (evt) => {
    const locatorId = evt.target.id || evt.target.offsetParent.id;
    const element = predictedElements?.find((elem) => elem.jdnHash === locatorId);

    sendMessage({
      message: ScriptMsg.ToggleElement,
      param: [element],
    });

    sendMessage({
      message: ScriptMsg.ToggleElementGroupIsChecked,
      param: [element],
    });
  };

  const onDocumentClick = (event) => {
    const highlightTarget = event.target.closest('.jdn-label');
    if (!highlightTarget) {
      const tooltip = document.querySelector('.jdn-tooltip');
      if (tooltip) tooltip.className = 'jdn-tooltip jdn-tooltip-hidden';
      return;
    }
  };

  const setDocumentListeners = () => {
    events.forEach((eventName) => {
      document.addEventListener(eventName, scrollListenerCallback, true);
    });

    document.addEventListener('dblclick', onElementDblClick);
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('mousemove', onMouseMove);

    listenersAreSet = true;
  };

  const detectScrollableContainers = () => {
    const nodes = document.querySelectorAll('*');

    const hasVerticalScroll = (node) =>
      node.scrollHeight > node.clientHeight &&
      (getComputedStyle(node).overflowY === 'scroll' || getComputedStyle(node).overflowY == 'auto');
    const hasHorizontalScroll = (node) =>
      node.scrollWidth > node.clientWidth &&
      (getComputedStyle(node).overflowX === 'scroll' || getComputedStyle(node).overflowX == 'auto');
    const isRootNode = (node) => node.parentElement === null || node.tagName === 'BODY';

    nodes.forEach((node) => {
      if ((hasVerticalScroll(node) || hasHorizontalScroll(node)) && !isRootNode(node)) {
        scrollableContainers.push(node);
      }
    });
  };

  const applyFilter = (classFilterValue) => {
    classFilter = classFilterValue;

    let needToDraw = false;
    predictedElements?.forEach((element) => {
      const div = document.getElementById(element.jdnHash);
      if (div) div.setAttribute('jdn-filtered', classFilter[element.type] ? 'true' : false);
      else classFilter[element.type] && (needToDraw = true);
    });
    if (needToDraw) findAndHighlight();
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    switch (message) {
      case ScriptMsg.SetHighlight:
        if (!listenersAreSet) setDocumentListeners();
        if (!scrollableContainers.length) detectScrollableContainers();
        findAndHighlight(param);
        break;
      case ScriptMsg.KillHighlight:
        removeHighlight(sendResponse)();
        break;
      case ScriptMsg.HighlightToggled:
        toggleElement(param);
        break;
      case ScriptMsg.ToggleDeleted:
        toggleDeletedElement(param);
        break;
      case ScriptMsg.AddElement:
        addHighlightElement(param);
        break;
      case ScriptMsg.RemoveElement:
        removeElement(param);
        break;
      case ScriptMsg.ChangeElementType:
        updateElement(param);
        break;
      case ScriptMsg.ChangeElementName:
        changeElementName(param);
        break;
      case ScriptMsg.ChangeStatus:
        changeGenerationStatus(param);
        break;
      case ScriptMsg.ToggleFilter:
        applyFilter(param);
        break;
      case ScriptMsg.SetActive:
        setActiveElement(param, true);
        break;
      case ScriptMsg.UnsetActive:
        updateElement(param);
        break;
      case ScriptMsg.ToggleActiveGroup:
        toggleActiveGroup(param);
        break;
      default:
        break;
    }
  };

  const disconnectHandler = () => {
    removeHighlight(() => console.log('JDN highlight has been killed'))();
    chrome.storage.sync.set({ IS_DISCONNECTED: true });
  };

  chrome.runtime.onConnect.addListener((p) => {
    port = p;
    port.onDisconnect.addListener(disconnectHandler);
    chrome.runtime.onMessage.addListener(messageHandler);
  });
};
