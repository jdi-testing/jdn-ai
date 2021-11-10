/*
    avoid using any outer scope variables inside this function
 */

/* global chrome */
export const highlightOnPage = () => {
  let highlightElements = [];
  let isHighlightElementsReverse = false;
  let port;
  let nodes;
  let predictedElements;
  let perception;

  const isInViewport = (element) => {
    const { top, right, bottom, left } = element.getBoundingClientRect();

    // at least a part of an element should be in the viewport
    const val =
      ((top >= 0 && top <= window.innerHeight) ||
        (bottom > 0 && bottom < window.innerHeight)) &&
      ((left >= 0 && left < window.innerWidth) ||
        (right >= 0 && right < window.innerWidth));

    return val;
  };

  const createLabelText = (element) => {
    const predictedProbabilityPercent = Math.round(element.predicted_probability * 100);
    return `${predictedProbabilityPercent}%, ${element.name}`;
  };

  const getClassName = (element) => {
    return `jdn-highlight ${element.generate ? 'jdn-primary' : 'jdn-secondary'}`;
  };

  const updateElement = (element) => {
    const i = predictedElements.findIndex((e) => e.element_id === element.element_id);
    predictedElements[i] = {...predictedElements[i], ...element};
    const div = document.getElementById(element.element_id);
    return div;
  };

  const toggleElement = (element) => {
    const div = updateElement(element);
    if (div) div.className = getClassName(element);
  };

  const toggleDeletedElement = (element) => {
    const div = updateElement(element);

    if (element.deleted) {
      if (div) {
        const i = highlightElements.findIndex((e) => e.getAttribute('jdn-hash') === element.element_id);
        highlightElements.splice(i, 1);
        div.remove();
      }
    } else {
      findAndHighlight();
    }
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

  const drawRectangle = (
      element,
      predictedElement
  ) => {
    const { element_id } = predictedElement;
    const divDefaultStyle = (rect) => {
      const { top, left, height, width } = rect || {};
      return rect ?
        {
          left: `${left + window.pageXOffset}px`,
          top: `${top + window.pageYOffset}px`,
          height: `${height}px`,
          width: `${width}px`,
        } :
        {};
    };
    const tooltipDefaultStyle = (rect) => {
      const {right, top, height, width} = rect;
      return rect ? {
        right: `calc(100% - ${right + window.pageXOffset - width/2}px)`,
        top: `${top + window.pageYOffset + height}px`,
      } : {};
    };
    const tooltipInnerHTML = () => {
      const el = predictedElements.find((e) => e.element_id === element_id);
      return `
      <p><b>Name:</b> ${el.name}</p>
      <p><b>Type:</b> ${el.type}</p>
      <p><b>Prediction accuracy:</b> ${Math.round(el.predicted_probability * 100)}%</p>`;
    };
    const div = document.createElement("div");
    div.id = element_id;
    div.className = getClassName(predictedElement);
    div.setAttribute("jdn-highlight", true);
    const tooltip = document.createElement('div');
    tooltip.className = 'jdn-tooltip';
    const labelContainer = document.createElement('div');
    const label = document.createElement('span');
    label.className = 'jdn-label';
    label.innerHTML = `<span class="jdn-class">${createLabelText(predictedElement)}</span>`;
    label.addEventListener('mouseover', () => {
      Object.assign(tooltip.style, tooltipDefaultStyle(label.getBoundingClientRect()));
      tooltip.innerHTML = tooltipInnerHTML();
      document.body.appendChild(tooltip);
    });
    label.addEventListener('mouseout', () => {
      document.body.removeChild(tooltip);
    });

    Object.assign(div.style, divDefaultStyle(element.getBoundingClientRect()));
    labelContainer.appendChild(label);
    div.insertAdjacentElement('afterBegin', labelContainer);
    div.onclick = () => {
      chrome.runtime.sendMessage({
        message: "TOGGLE_ELEMENT",
        param: element_id,
      });
    };

    document.body.appendChild(div);
    highlightElements.push(element);
  };

  const clearContainer = (parent) => {
    nodes.forEach((node) => {
      if (parent.contains(node)) {
        const id = node.getAttribute('jdn-hash');
        predictedElements.find((elem) => elem.element_id === id).deleted = true;
        chrome.runtime.sendMessage({
          message: "REMOVE_ELEMENT",
          param: id,
        });
        chrome.runtime.sendMessage({
          message: "PREDICTION_IS_UNACTUAL"
        });
      };
    });
  };

  const findAndHighlight = (param) => {
    if (param) {
      predictedElements = param.elements;
      perception = param.perception;
    }
    let query = "";
    predictedElements.forEach(({ element_id, deleted }) => {
      if (deleted) return;
      query += `${!!query.length ? ", " : ""}[jdn-hash='${element_id}']`;
    });
    nodes = document.querySelectorAll(query);
    nodes.forEach((element) => {
      if (isInViewport(element)) {
        const hash = element.getAttribute("jdn-hash");
        const highlightElement = document.getElementById(hash);
        const isAbovePerceptionTreshold = predictedElements.find((e) => {
          return hash === e.element_id && e.predicted_probability >= perception;
        });
        if (!!highlightElement && !isAbovePerceptionTreshold) {
          highlightElement.remove();
        } else if (!highlightElement && isAbovePerceptionTreshold) {
          const predicted = predictedElements.find(
              (e) => e.element_id === hash
          );
          drawRectangle(element, predicted);
        }
      }
    });
  };

  let timer;
  const scrollListenerCallback = ({ target }) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (target !== document) clearContainer(target);
      findAndHighlight();
    }, 300);
  };

  const selectAllElementsOnClick = (event) => {
    if (!isHighlightElementsReverse) {
      highlightElements.reverse();
      isHighlightElementsReverse = true;
    }

    let isCurrentElement = false;

    highlightElements.forEach((element) => {
      const { top, right, bottom, left } = element.getBoundingClientRect();

      if (
        event.clientX > left &&
        event.clientX < right &&
        event.clientY > top &&
        event.clientY < bottom
      ) {
        if (!isCurrentElement) {
          isCurrentElement = true;
          return;
        } else {
          const div = document.getElementById(element.getAttribute("jdn-hash"));
          div.click();
        }
      }
    });
  };

  const removeHighlightElements = (callback) => {
    if (predictedElements) {
      predictedElements.forEach(({ element_id: elementId }) => {
        const el = document.getElementById(elementId);
        if (el) el.remove();
      });
      highlightElements = [];
      callback();
    }
  };

  const events = ["scroll", "resize"];
  const removeEventListeners = () => {
    events.forEach((eventName) => {
      document.removeEventListener(eventName, scrollListenerCallback, true);
    });
    document.removeEventListener("click", clickListener);
  };

  const removeHighlight = (callback) => () => {
    removeEventListeners(removeHighlightElements(callback));
  };

  const clickListener = (event) => {
    if (!event.clientX && !event.clientY) return;
    selectAllElementsOnClick(event);
  };

  const setDocumentListeners = () => {
    events.forEach((eventName) => {
      document.addEventListener(eventName, scrollListenerCallback, true);
    });

    document.addEventListener("click", clickListener);
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    if (message === "SET_HIGHLIGHT") {
      if (!highlightElements.length) setDocumentListeners();
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

    if (message === "CHANGE_ELEMENT_TYPE") {
      updateElement(param);
    }

    if (message === "CHANGE_ELEMENT_NAME") {
      changeElementName(param);
    }

    if (message === "CHANGE_STATUS") {
      changeGenerationStatus(param);
    }

    if (message === "PING_SCRIPT" && (param.scriptName === "highlightOnPage")) {
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
