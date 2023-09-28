export function highlightOrder() {
  const getOverlappedHighlightings = (id) => {
    const overlappedNodes = [];
    const origNode = document.getElementById(id);
    const { left: origLeft, right: origRight, top: origTop, bottom: origBottom } = origNode.getBoundingClientRect();

    const proposedNodes = document.querySelectorAll('[jdn-highlight=true]');
    proposedNodes.forEach((node) => {
      const { left, right, top, bottom } = node.getBoundingClientRect();
      if (
        ((left >= origLeft && left <= origRight) || (right >= origLeft && right <= origRight)) &&
        ((top >= origTop && top <= origBottom) || (bottom >= origTop && bottom <= origBottom))
      ) {
        overlappedNodes.push(node);
      }
    });

    return overlappedNodes;
  };

  const getUtterZIndex = (nodes, comparation) => {
    const zIndex = nodes.reduce((accum, current) => {
      return Math[comparation](window.getComputedStyle(current).zIndex, accum);
    }, window.getComputedStyle(nodes[0]).zIndex);
    return zIndex;
  };

  const bringToFront = (elements) => {
    elements.forEach((_element) => {
      const id = _element.jdnHash;
      const maxZIndex = getUtterZIndex(getOverlappedHighlightings(id), 'max');
      const node = document.getElementById(id);
      node.style.zIndex = maxZIndex + 1;
    });
  };

  const bringToBack = (elements) => {
    elements.forEach((_element) => {
      const id = _element.jdnHash;
      const minZIndex = getUtterZIndex(getOverlappedHighlightings(id), 'min');
      const node = document.getElementById(id);
      node.style.zIndex = minZIndex - 1;
    });
  };

  chrome.storage.onChanged.addListener((event) => {
    if (event.hasOwnProperty('JDN_BRING_TO_FRONT')) bringToFront(event.JDN_BRING_TO_FRONT.newValue.predictedElements);
    if (event.hasOwnProperty('JDN_BRING_TO_BACKGROUND')) {
      bringToBack(event.JDN_BRING_TO_BACKGROUND.newValue.predictedElements);
    }
  });
}
