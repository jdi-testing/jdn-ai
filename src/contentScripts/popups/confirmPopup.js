export const confirmPopup = () => {
  let config = {};

  chrome.runtime.sendMessage({
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
    modal.classList.add("jdn-download-popup");

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

    const confirmButton = document.createElement("button");
    confirmButton.classList.add("jdn-popup__button");
    confirmButton.classList.add("jdn-popup__button_primary");
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

    main.append(buttonContainer);

    modal.append(header);
    modal.append(closeButton);
    modal.append(main);

    background.append(modal);
    wrapper.append(background);
    document.body.append(wrapper);

    function removePopup() {
      chrome.runtime.sendMessage({
        message: "IS_OPEN_MODAL",
        param: false,
      });
      wrapper.remove();
    }

    function confirm() {
      chrome.runtime.sendMessage({
        message: config.scriptMessage,
      });
      wrapper.remove();
    }
  };

  chrome.storage.sync.get(['POPUP_CONFIG'], ({POPUP_CONFIG}) => {
    config = POPUP_CONFIG;
    showPopup();
  });
};
