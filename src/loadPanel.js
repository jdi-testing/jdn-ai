window.onload = () => {
  /* global chrome */
  /* eslint no-undef: "error" */
  chrome.devtools.panels.create("JDN", "icon.png", "panel.html", (panel) => {
    console.log(panel);
  });
};

window.onbeforeunload = clearTabSession;

function clearTabSession() {
  if (localStorage.getItem('secondSession')) {
    localStorage.removeItem('secondSession');
  } else {
    localStorage.removeItem('firstSession');
    localStorage.removeItem('secondSession');
  }
}
