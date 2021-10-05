export function highlightOrder() {
    const getOverlappedHighlightings = (id) => {
        const overlappedNodes = [];
        const origNode = document.getElementById(id);
        const { left: origLeft, right: origRight, top: origTop, bottom: origBottom } = origNode.getBoundingClientRect();

        const proposedNodes = document.querySelectorAll('[jdn-highlight=true]');
        proposedNodes.forEach((node) => {
            const { left, right, top, bottom } = node.getBoundingClientRect();
            if (
                ((left >= origLeft && left <= origRight) ||
                    (right >= origLeft && right <= origRight)) &&
                ((top >= origTop && top <= origBottom) ||
                    (bottom >= origTop && bottom <= origBottom))
            ) overlappedNodes.push(node);
        });

        return overlappedNodes;
    }

    const getUtterZIndex = (nodes, comparation) => {
        const zIndex = nodes.reduce(
            ((accum, current) => {
                return Math[comparation](window.getComputedStyle(current).zIndex, accum)
            }), window.getComputedStyle(nodes[0]).zIndex
        );
        return zIndex;
    }

    const bringToFront = (id) => {
        const maxZIndex = getUtterZIndex(getOverlappedHighlightings(id), 'max');
        const node = document.getElementById(id);
        node.style.zIndex = maxZIndex + 1;
    }

    const bringToBack = (id) => {
        const minZIndex = getUtterZIndex(getOverlappedHighlightings(id), 'min');
        const node = document.getElementById(id);
        node.style.zIndex = minZIndex - 1;
    }

    const messageHandler = ({ message, param }, sender, sendResponse) => {
        if (message === "PING_SCRIPT" && (param.scriptName === "highlightOrder")) {
            sendResponse({ message: true });
        }
    };

    chrome.runtime.onMessage.addListener(messageHandler);
    chrome.storage.onChanged.addListener((event) => {
        if (event.hasOwnProperty('JDN_BRING_TO_FRONT')) bringToFront(event.JDN_BRING_TO_FRONT.newValue.element_id);
        if (event.hasOwnProperty('BRING_TO_BACKGROUND')) bringToBack(event.BRING_TO_BACKGROUND.newValue.element_id);
    });
}