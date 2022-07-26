/*
    avoid using any outer scope variables inside this function
 */

/* global chrome */
export const highlightOnPage = () => {
  let port;
  let nodes;
  let predictedElements;
  let perception;
  let listenersAreSet;
  let scrollableContainers = [];

  const clearState = () => {
    nodes = null;
    predictedElements = null;
    scrollableContainers = [];
  };

  const isInViewport = (element) => {
    const { top, right, bottom, left } = element.getBoundingClientRect();

    // at least a part of an element should be in the viewport
    return (
      ((top >= 0 && top <= window.innerHeight) || (bottom > 0 && bottom < window.innerHeight)) &&
      ((left >= 0 && left < window.innerWidth) || (right >= 0 && right < window.innerWidth))
    );
  };

  const isHiddenByOverflow = (element) => {
    const container = scrollableContainers.find((_container) => _container.contains(element));

    if (!container) return false;

    const {
      top: containerTop,
      right: containerRight,
      bottom: containerBottom,
      left: containerLeft,
    } = container.getBoundingClientRect();

    const {
      top: elementTop,
      right: elementRight,
      bottom: elementBottom,
      left: elementLeft,
    } = element.getBoundingClientRect();

    return (
      elementTop > containerBottom ||
      elementBottom < containerTop ||
      elementLeft > containerRight ||
      elementRight < containerLeft
    );
  };

  const createLabelText = (element) => {
    const predictedProbabilityPercent = Math.round(element.predicted_probability * 100);
    return `${predictedProbabilityPercent}%, ${element.name}`;
  };

  const getClassName = (element) => {
    return `jdn-highlight ${element.generate ? "jdn-primary" : "jdn-secondary"}`;
  };

  const updateElement = (element) => {
    if (!predictedElements) return null;
    const i = predictedElements.findIndex((e) => e.element_id === element.element_id);
    predictedElements[i] = { ...predictedElements[i], ...element };
    const div = document.getElementById(predictedElements[i].jdnHash);
    return div;
  };

  const toggleElement = ({ element, skipScroll }) => {
    const div = updateElement(element);
    if (div) {
      div.className = getClassName(element);
    }
    if (!skipScroll) {
      const originDiv = document.querySelector(`[jdn-hash='${element.jdnHash}']`);
      if ((!isInViewport(originDiv) || isHiddenByOverflow(originDiv)) && element.generate) {
        originDiv.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }
  };

  const toggleDeletedElement = (element) => {
    const div = updateElement(element);

    if (element.deleted) {
      if (div) div.remove();
    } else {
      findAndHighlight();
    }
  };

  const removeElement = (element) => {
    const j = predictedElements.findIndex((e) => e.element_id === element?.element_id);
    predictedElements.splice(j, 1);

    const div = document.getElementById(element?.jdnHash);
    if (div) div.remove();
  };

  const addHighlightElement = (element) => {
    predictedElements.push(element);
    findAndHighlight();
  };

  const changeElementName = (element) => {
    const div = updateElement(element);
    div.querySelector(".jdn-class").textContent = createLabelText(element);
  };

  const changeGenerationStatus = (element) => {
    const div = updateElement(element);
    if (!div) return;
    div.setAttribute("jdn-status", element.locator.taskStatus);
  };

  const drawRectangle = (element, predictedElement) => {
    const { element_id, jdnHash } = predictedElement;
    const divPosition = (rect) => {
      const { top, left, height, width } = rect || {};
      return rect ?
        {
          left: `${left + window.pageXOffset + document.body.scrollLeft}px`,
          top: `${top + window.pageYOffset + document.body.scrollTop}px`,
          height: `${height}px`,
          width: `${width}px`,
        } :
        {};
    };
    const tooltipDefaultStyle = (rect) => {
      const { right, top, height, width } = rect;
      return rect ?
        {
          right: `calc(100% - ${right + window.pageXOffset - width / 2}px)`,
          top: `${top + window.pageYOffset + height}px`,
        } :
        {};
    };
    const tooltipInnerHTML = () => {
      const el = predictedElements.find((e) => e.element_id === element_id);
      return `
      <p class="jdn-tooltip-paragraph"><b>Name:</b> ${el.name}</p>
      <p class="jdn-tooltip-paragraph"><b>Type:</b> ${el.type}</p>
      <p class="jdn-tooltip-paragraph"><b>Prediction accuracy:</b> ${Math.round(el.predicted_probability * 100)}%</p>`;
    };

    const checkTooltipVisibility = (tooltip, label) => {
      const { left: tooltipLeft, right: tooltipRight, width: tooltipWidth } = tooltip.getBoundingClientRect();
      const { top: labelTop, height: labelHeight } = label.getBoundingClientRect();
      if (tooltipLeft < 0) {
        document.body.removeChild(tooltip);
        tooltip.style.right = `calc(100% - ${tooltipRight}px - ${tooltipWidth}px - ${window.pageXOffset}px)`;
        tooltip.classList.add("jdn-tooltip-right");
        document.body.appendChild(tooltip);
      }

      const { bottom: bodyBottom } = document.body.getBoundingClientRect();
      const { bottom: tooltipBottom } = tooltip.getBoundingClientRect();
      if (bodyBottom < tooltipBottom) {
        const { height: tooltipHeight } = tooltip.getBoundingClientRect();
        const cornerHeight = 19;
        document.body.removeChild(tooltip);
        tooltip.style.top = `${labelTop + window.pageYOffset - tooltipHeight - cornerHeight - labelHeight}px`;
        tooltip.classList.add("jdn-tooltip-top");
        document.body.appendChild(tooltip);
      }
    };

    const div = document.createElement("div");
    div.id = jdnHash;
    div.className = getClassName(predictedElement);
    div.setAttribute("jdn-highlight", true);
    div.setAttribute("jdn-status", predictedElement.locator.taskStatus);
    const tooltip = document.createElement("div");
    tooltip.className = "jdn-tooltip";
    const labelContainer = document.createElement("div");
    const label = document.createElement("span");
    label.className = "jdn-label";
    label.innerHTML = `<span class="jdn-class">${createLabelText(predictedElement)}</span>`;
    label.addEventListener("mouseover", () => {
      Object.assign(tooltip.style, tooltipDefaultStyle(label.getBoundingClientRect()));
      tooltip.innerHTML = tooltipInnerHTML();
      document.body.appendChild(tooltip);
      checkTooltipVisibility(tooltip, label);
    });
    label.addEventListener("mouseout", () => {
      document.body.removeChild(tooltip);
    });

    Object.assign(div.style, divPosition(element.getBoundingClientRect()));
    labelContainer.appendChild(label);
    div.insertAdjacentElement("afterBegin", labelContainer);
    div.onclick = () => {
      chrome.runtime.sendMessage({
        message: "TOGGLE_ELEMENT",
        param: element_id,
      }).catch((error) => {
        if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
      });
    };

    document.body.appendChild(div);
  };

  const clearContainer = (container) => {
    nodes.forEach((node) => {
      if (container.contains(node)) {
        const jdnHash = node.getAttribute("jdn-hash");
        const div = document.getElementById(jdnHash);
        if (div) div.remove();
      }
    });
  };

  const findAndHighlight = (param) => {
    if (param) {
      if (!predictedElements) predictedElements = param.elements;
      perception = param.perception;
    }
    let query = "";
    predictedElements.forEach(({ element_id, deleted, jdnHash }) => {
      if (deleted) return;
      query += `${!!query.length ? ", " : ""}[jdn-hash='${jdnHash}']`;
    });
    nodes = document.querySelectorAll(query);
    nodes.forEach((element) => {
      if (isInViewport(element) && !isHiddenByOverflow(element)) {
        const hash = element.getAttribute("jdn-hash");
        const highlightElement = document.getElementById(hash);
        const isAbovePerceptionTreshold = predictedElements.find((e) => {
          return hash === e.jdnHash && e.predicted_probability >= perception;
        });
        if (!!highlightElement && !isAbovePerceptionTreshold) {
          highlightElement.remove();
        } else if (!highlightElement && isAbovePerceptionTreshold) {
          const predicted = predictedElements.find((e) => e.jdnHash === hash);
          drawRectangle(element, predicted);
        }
      }
    });
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

  const removeHighlightElements = (callback) => {
    if (predictedElements) {
      predictedElements.forEach(({ jdnHash }) => {
        const el = document.getElementById(jdnHash);
        if (el) el.remove();
      });
      clearState();
      callback();
    }
  };

  const events = ["scroll", "resize"];
  const removeEventListeners = () => {
    events.forEach((eventName) => {
      document.removeEventListener(eventName, scrollListenerCallback, true);
    });
    document.removeEventListener("click", clickListener);
    listenersAreSet = false;
  };

  const removeHighlight = (callback) => () => {
    removeEventListeners(removeHighlightElements(callback));
  };

  const clickListener = (event) => {
    if (!event.clientX && !event.clientY) return;
  };

  const setDocumentListeners = () => {
    events.forEach((eventName) => {
      document.addEventListener(eventName, scrollListenerCallback, true);
    });

    document.addEventListener("click", clickListener);

    listenersAreSet = true;
  };

  const detectScrollableContainers = () => {
    const nodes = document.querySelectorAll("*");

    const hasVerticalScroll = (node) =>
      node.scrollHeight > node.clientHeight &&
      (getComputedStyle(node).overflowY === "scroll" || getComputedStyle(node).overflowY == "auto");
    const hasHorizontalScroll = (node) =>
      node.scrollWidth > node.clientWidth &&
      (getComputedStyle(node).overflowX === "scroll" || getComputedStyle(node).overflowX == "auto");
    const isRootNode = (node) => node.parentElement === null;

    nodes.forEach((node) => {
      if ((hasVerticalScroll(node) || hasHorizontalScroll(node)) && !isRootNode(node)) {
        scrollableContainers.push(node);
      }
    });
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    if (message === "SET_HIGHLIGHT") {
      if (!listenersAreSet) setDocumentListeners();
      if (!scrollableContainers.length) detectScrollableContainers();
      findAndHighlight(param);
    }

    if (message === "KILL_HIGHLIGHT") {
      removeHighlight(sendResponse)();
    }

    if (message === "HIGHLIGHT_TOGGLED") {
      toggleElement(param);
    }

    if (message === "TOGGLE_DLETED") {
      toggleDeletedElement(param);
    }

    if (message === "ADD_ELEMENT") {
      addHighlightElement(param);
    }

    if (message === "REMOVE_ELEMENT") {
      removeElement(param);
    }

    if (message === "CHANGE_ELEMENT_TYPE") {
      updateElement(param);
    }

    if (message === "CHANGE_ELEMENT_NAME") {
      changeElementName(param);
    }

    if (message === "CHANGE_STATUS") {
      changeGenerationStatus(param);
    }

    if (message === "PING_SCRIPT" && param.scriptName === "highlightOnPage") {
      sendResponse({ message: true });
    }
  };

  const disconnectHandler = () => {
    removeHighlight(() => console.log("JDN highlight has been killed"))();
    chrome.storage.sync.set({ IS_DISCONNECTED: true });
  };

  chrome.runtime.onConnect.addListener((p) => {
    port = p;
    port.onDisconnect.addListener(disconnectHandler);
    chrome.runtime.onMessage.addListener(messageHandler);
  });
};
