export function createOverlay() {
  const overlayID = 'jdn-overlay-' + Date.now().toString().substring(5);
  const overlay = document.createElement('div');
  overlay.id = overlayID;
  overlay.setAttribute('jdn-highlight', true);
  const overlayStyle = {
    top: 0,
    left: 0,
    position: 'fixed',
    width: '100%',
    height: '100%',
    zIndex: 12000,
    backgroundColor: 'rgba(0,0,0,.15)',
  };
  Object.assign(overlay.style, overlayStyle);
  document.body.appendChild(overlay);

  chrome.storage.onChanged.addListener((event) => {
    if (event.hasOwnProperty('IS_DISCONNECTED')) overlay.remove();
  });

  return overlayID;
}
