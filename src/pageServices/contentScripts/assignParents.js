export const assignParents = () => {
  const findParents = (elements) => {
    elements.forEach((element) => {
      const div = document.querySelector(`[jdn-hash='${element.jdnHash}']`);
      div.setAttribute("jdn-marked", true);
    });

    elements.forEach((element) => {
      const node = document.querySelector(`[jdn-hash='${element.jdnHash}'`);
      const parent = node.closest(`[jdn-marked=true]:not([jdn-hash='${element.jdnHash}'])`);
      const parentHash = parent ? parent.getAttribute("jdn-hash") : "";
      if (parentHash.length) {
        element.parent_id = parentHash;
      } else element.parent_id = "";
    });

    const marked = document.querySelectorAll("[jdn-marked]");
    marked.forEach((node) => node.removeAttribute("jdn-marked"));

    return elements;
  };


  chrome.runtime.onMessage.addListener(({ message, param }, sender, sendResponse) => {
    if (message === "ASSIGN_PARENTS") {
      sendResponse(findParents(param));
    }
  });
};
