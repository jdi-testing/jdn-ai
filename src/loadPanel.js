window.onload = () => {
  /* global chrome */
  /* eslint no-undef: "error" */
  chrome.devtools.panels.create("JDN", "icon.png", "panel.html", (panel) => {
    console.log(panel);
  });
};
