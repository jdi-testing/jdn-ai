export const editLocatorPopup = () => {
  let backgroundModal;
  let modal;

  const removePopup = () => {
    chrome.runtime.sendMessage({
      message: "IS_OPEN_MODAL",
      param: false,
    });
    backgroundModal.remove();
    // modal.remove();
  };

  const showDialog = (locatorElement, types) => {
    const {type, name, locator, element_id} = locatorElement;

    const onFormSubmit = ({ target: { type, name, locator } }) => {
      console.log([type, name, locator]);
      chrome.runtime.sendMessage({
        message: "UPDATE_LOCATOR",
        param: {
          element_id: element_id,
          type: type.value,
          name: name.value,
          locator: locator.value,
        },
      });
      removePopup();
    };

    backgroundModal = document.createElement("div");
    backgroundModal.classList.add("jdn-popup-bg");

    modal = document.createElement("dialog");
    modal.setAttribute("open", true);
    modal.classList.add("jdn-settings-popup__modal");

    const modalCloseButton = document.createElement("button");
    modalCloseButton.innerHTML = "&#215;";
    modalCloseButton.classList.add("jdn-settings-popup__modal__close-button");
    modalCloseButton.onclick = removePopup;
    modal.appendChild(modalCloseButton);
    const heading = document.createElement("h4");
    heading.innerHTML = "Edit";
    modal.appendChild(heading);

    const form = document.createElement("form");
    form.onsubmit = (event) => {
      event.preventDefault();
      onFormSubmit(event);
    };

    modal.appendChild(form);

    const labelType = document.createElement("label");
    labelType.innerHTML = "Block type:";
    form.appendChild(labelType);

    const selectType = document.createElement("select");
    selectType.setAttribute("name", "type");
    selectType.value = type;
    labelType.appendChild(selectType);

    types.forEach(({label, jdi}) => {
      const option = document.createElement("option");
      option.setAttribute("value", label);
      option.innerHTML = jdi;
      selectType.appendChild(option);
    });

    const labelName = document.createElement("label");
    labelName.innerHTML = "Name:";
    form.appendChild(labelName);

    const inputName = document.createElement("input");
    inputName.setAttribute("name", "name");
    inputName.classList.add("jdn-change-element-name-modal__form-input");
    inputName.value = name;
    labelName.appendChild(inputName);

    const labelLocator = document.createElement("label");
    labelLocator.innerHTML = "Locator:";
    form.appendChild(labelLocator);

    const inputLocator = document.createElement("textarea");
    inputLocator.setAttribute("name", "locator");
    inputLocator.classList.add("jdn-change-element-name-modal__form-input");
    inputLocator.value = locator.customXpath || locator.robulaXpath || locator.fullXpath;
    labelLocator.appendChild(inputLocator);

    const buttonCancel = document.createElement("button");
    buttonCancel.classList.add("jdn-report-problem-popup__button");
    buttonCancel.innerText = "Cancel";
    buttonCancel.onclick = removePopup;
    form.appendChild(buttonCancel);

    const buttonOk = document.createElement("input");
    buttonOk.classList.add("jdn-settings-popup__button--ok");
    buttonOk.setAttribute("type", "submit");
    buttonOk.innerText = "Save";
    form.appendChild(buttonOk);

    backgroundModal.append(modal);
    document.body.append(backgroundModal);
  };

  chrome.storage.onChanged.addListener((event) => {
    const newValue = event?.OPEN_EDIT_LOCATOR?.newValue;
    if (newValue?.isOpen === true) {
      chrome.runtime.sendMessage({
        message: "IS_OPEN_MODAL",
        param: true,
      });
      showDialog(newValue.value, newValue.types);
    }
  });

  chrome.storage.onChanged.addListener((event) => {
    if (event?.IS_DISCONNECTED?.newValue === true) {
      removePopup();
    }
  });
};
