export const editLocatorPopup = () => {
  let backgroundModal;
  let modal;

  const removePopup = () => {
    chrome.runtime.sendMessage({
      message: "IS_OPEN_MODAL",
      param: false,
    });
    backgroundModal.remove();
    chrome.storage.sync.set({ OPEN_EDIT_LOCATOR: { isOpen: false } });
  };

  const showDialog = (locatorElement, types) => {
    const { type, name, locator, element_id } = locatorElement;

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
    modal.classList.add("jdn-popup");
    modal.classList.add("jdn-edit-popup");

    const modalCloseButton = document.createElement("button");
    modalCloseButton.classList.add("jdn-popup__button_close");
    modalCloseButton.innerHTML = "&#215;";
    modalCloseButton.onclick = removePopup;
    modal.appendChild(modalCloseButton);

    const heading = document.createElement("h4");
    heading.classList.add("jdn-popup__header");
    heading.innerHTML = "Edit";
    modal.appendChild(heading);

    const main = document.createElement("div");
    main.classList.add("jdn-popup__main");
    modal.appendChild(main);

    const form = document.createElement("form");
    form.onsubmit = (event) => {
      event.preventDefault();
      onFormSubmit(event);
    };
    main.appendChild(form);

    const labelType = document.createElement("label");
    labelType.classList.add("jdn-edit-popup__label");
    labelType.classList.add("jdn-popup__label");
    labelType.innerHTML = "Block type:";
    form.appendChild(labelType);

    const selectType = document.createElement("select");
    selectType.classList.add("jdn-edit-popup__select");
    selectType.setAttribute("name", "type");
    labelType.appendChild(selectType);

    types.forEach(({ label, jdi }) => {
      const option = document.createElement("option");
      option.setAttribute("value", label);
      option.innerHTML = jdi;
      if (label === type) option.setAttribute("selected", true);
      selectType.appendChild(option);
    });

    const labelName = document.createElement("label");
    labelName.classList.add("jdn-edit-popup__label");
    labelName.classList.add("jdn-popup__label");
    labelName.innerHTML = "Name:";
    form.appendChild(labelName);

    const inputName = document.createElement("input");
    inputName.setAttribute("name", "name");
    inputName.value = name;
    labelName.appendChild(inputName);

    const labelLocator = document.createElement("label");
    labelLocator.classList.add("jdn-edit-popup__label");
    labelLocator.classList.add("jdn-popup__label");
    // labelLocator.innerHTML = "<span className='jdn-edit-popup__label-text'>Locator:</span>";
    labelLocator.innerHTML = "Locator:";
    form.appendChild(labelLocator);

    const inputLocator = document.createElement("textarea");
    inputLocator.setAttribute("name", "locator");
    inputLocator.setAttribute("rows", "5");
    inputLocator.setAttribute("cols", "30");
    inputLocator.value = locator.customXpath || locator.robulaXpath || locator.fullXpath;
    labelLocator.appendChild(inputLocator);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("jdn-popup__button-container");
    form.append(buttonContainer);

    const buttonCancel = document.createElement("button");
    buttonCancel.classList.add("jdn-popup__button");
    buttonCancel.classList.add("jdn-popup__button_tertiary");
    buttonCancel.innerText = "Cancel";
    buttonCancel.onclick = removePopup;
    buttonContainer.appendChild(buttonCancel);

    const buttonOk = document.createElement("button");
    buttonOk.classList.add("jdn-popup__button");
    buttonOk.classList.add("jdn-popup__button_primary");
    buttonOk.setAttribute("type", "submit");
    buttonOk.innerText = "Save";
    buttonContainer.appendChild(buttonOk);

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
