export function createOverlay() {
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
    backgroundColor: "rgba(0,0,0,.15)",
  };
  Object.assign(overlay.style, overlayStyle);
  document.body.appendChild(overlay);

  return overlayID;
}
