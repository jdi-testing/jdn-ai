export const confirmPopup = () => {
  let config = {};


  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  sendMessage({
    message: "IS_OPEN_MODAL",
    param: true,
  });

  const showPopup = () => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "jdn-popup-wrapper");

    const background = document.createElement("div");
    background.classList.add("jdn-popup-bg");

    const modal = document.createElement("dialog");
    modal.setAttribute('open', true);
    modal.classList.add("jdn-popup");
    modal.classList.add("jdn-confirm-popup");

    const header = document.createElement('h4');
    header.classList.add('jdn-popup__header');
    header.innerHTML = config.header;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = "&#215;";
    closeButton.classList.add('jdn-popup__button_close');
    closeButton.onclick = removePopup;

    const main = document.createElement('div');
    main.classList.add("jdn-popup__main");
    main.innerHTML = config.content;

    const altButton = document.createElement("button");
    altButton.classList.add("jdn-popup__button");
    altButton.classList.add("jdn-popup__button_primary");
    altButton.innerText = config.altButtonText;
    altButton.onclick = altAction;

    const confirmButton = document.createElement("button");
    confirmButton.classList.add("jdn-popup__button");
    confirmButton.classList.add(config.buttonConfirmClass || "jdn-popup__button_primary");
    confirmButton.innerText = config.buttonConfirmText;
    confirmButton.onclick = confirm;

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("jdn-popup__button");
    cancelButton.classList.add("jdn-popup__button_tertiary");
    cancelButton.innerText = "Cancel";
    cancelButton.onclick = removePopup;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("jdn-popup__button-container");
    buttonContainer.append(cancelButton);
    buttonContainer.append(confirmButton);
    config.altButtonText && buttonContainer.append(altButton);

    main.append(buttonContainer);

    modal.append(header);
    modal.append(closeButton);
    modal.append(main);

    background.append(modal);
    wrapper.append(background);
    document.body.append(wrapper);

    function removePopup() {
      sendMessage({
        message: "IS_OPEN_MODAL",
        param: false,
      });
      wrapper.remove();
    }

    function confirm() {
      sendMessage({
        message: config.scriptMessage,
      });
      wrapper.remove();
    }

    function altAction() {
      sendMessage({
        message: config.altScriptMessage,
      });
      wrapper.remove();
    }
  };

  chrome.storage.sync.get(['POPUP_CONFIG'], ({POPUP_CONFIG}) => {
    config = POPUP_CONFIG;
    showPopup();
  });
};
