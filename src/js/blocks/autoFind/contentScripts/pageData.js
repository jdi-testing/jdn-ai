export const getPageData = () => {
  function createOverlay() {
    const overlayID = "jdn-overlay-" + Date.now().toString().substring(5);
    const overlay = document.createElement("div");
    overlay.id = overlayID;
    const overlayStyle = {
      top: 0,
      left: 0,
      position: "fixed",
      width: "100%",
      height: "100%",
      zIndex: 999999,
      backgroundColor: "rgba(0,0,0,.3)",
    };
    Object.assign(overlay.style, overlayStyle);
    document.body.appendChild(overlay);

    return overlayID;
  }
  const overlayID = createOverlay();

  chrome.runtime.sendMessage({ message: "START_COLLECT_DATA", param: { overlayID }});

  const hashAttribute = 'jdn-hash';
  function gen_uuid(e) {
    let hashValue = e.getAttribute(hashAttribute);
    if (!hashValue) {
      hashValue =
        Math.random().toString().substring(2, 12) +
        Date.now().toString().substring(5) +
        Math.random().toString().substring(2, 12);
      e.setAttribute(hashAttribute, hashValue);
    }
    return e;
  }

  function assign_uuid() {
    [...document.querySelectorAll(`*:not(#${overlayID}`)].forEach((el) => {
      gen_uuid(el);
    });
  }

  function collect_attributes(el) {
    const items = {};
    for (let index = 0; index < el.attributes.length; ++index) {
      items[el.attributes[index].name] = el.attributes[index].value;
    }
    return items;
  }

  function getTreeDataset() {
    return [...document.querySelectorAll(`*:not(#${overlayID}`)].map((el) => {
      const _x = pageXOffset + el.getBoundingClientRect()["x"];
      const _y = pageYOffset + el.getBoundingClientRect()["y"];
      const _width = el.getBoundingClientRect()["width"];
      const _height = el.getBoundingClientRect()["height"];
      const _displayed = (_x < 0) | (_y < 0) | (_width <= 1) | (_height <= 1);

      return {
        tag_name: el.tagName,
        element_id: el.getAttribute(hashAttribute),
        parent_id: el.parentElement == null ? null : el.parentElement.getAttribute(hashAttribute),
        x: _x,
        y: _y,
        width: _width,
        height: _height,
        displayed: !_displayed,
        onmouseover: el.onmouseover,
        onmouseenter: el.onmouseenter,
        attributes: collect_attributes(el),
        text: el.innerText,
        style: window.getComputedStyle(el),
      };
    });
  }

  assign_uuid();
  const res = getTreeDataset();
  /*
    IMPORTANT! stringify them right here for not to change fiels order.
    Otherwise 500 server error occurs
  */
  return [JSON.stringify(res), res.length];
};
