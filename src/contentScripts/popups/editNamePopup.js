export const editNamePopup = () => {
  let backgroundModal;
  let modal;
  let wrapper;

  const ERROR_TYPE = {
    DUPLICATED_NAME: "DUPLICATED_NAME",
    EMPTY_VALUE: "EMPTY_VALUE",
    INVALID_NAME: "INVALID_NAME",
    LONG_NAME: "LONG_NAME",
  };

  const ERROR_MESSAGE = {
    [ERROR_TYPE.DUPLICATED_NAME]: "This name already exists.",
    [ERROR_TYPE.EMPTY_VALUE]: "Please fill out this field.",
    [ERROR_TYPE.INVALID_NAME]: "This name is not a valid Java class name.",
    [ERROR_TYPE.LONG_NAME]: "Max name length is 255 characters.",
  };

  const removePopup = () => {
    chrome.runtime.sendMessage({
      message: "IS_OPEN_MODAL",
      param: false,
    });
    wrapper.remove();
    chrome.storage.sync.set({ OPEN_EDIT_NAME: { isOpen: false } });
  };

  const showDialog = (value) => {
    const { name, element_id, id } = value;
    currentElement = element_id;

    const onFormSubmit = ({ target }) => {
      const { name } = target;

      chrome.runtime.sendMessage({
        message: "UPDATE_PAGE_OBJECT_NAME",
        param: {
          id,
          name: name.value,
        },
      });
      removePopup();
    };

    const getNameValidationMessage = ({ value }) => {
      const isValidJavaVariable = /^[A-Z][a-zA-Z0-9_$]*$/.test(value);
      if (!isValidJavaVariable) return ERROR_TYPE.INVALID_NAME;
      if (value.length > 255) return ERROR_TYPE.LONG_NAME;

      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {
              message: "CHECK_PO_NAME_VALIDITY",
              param: {
                element_id,
                newName: value,
              },
            },
            (response) => resolve(response)
        );
      });
    };

    const addValidation = (input, invalidInputClass, messageContainer, getErrorMessage) => {
      const checkInput = async (targetInput) => {
        if (targetInput.validity.valueMissing) {
          targetInput.setCustomValidity(ERROR_TYPE.EMPTY_VALUE);
        } else if (getErrorMessage) {
          const message = await getErrorMessage(targetInput);
          targetInput.setCustomValidity(message || "");
        } else targetInput.setCustomValidity("");

        messageContainer.innerHTML = ERROR_MESSAGE[targetInput.validationMessage] || "";
        input.checkValidity();

        // format input
        if (!targetInput.validity.valid) {
          targetInput.classList.add(invalidInputClass);
        } else {
          targetInput.classList.remove(invalidInputClass);
        }

        // format Save button
        if (inputName.validity.valid) {
          buttonOk.classList.replace("jdn-popup__button_disabled", "jdn-popup__button_primary");
          buttonOk.removeAttribute("disabled");
        } else {
          buttonOk.classList.replace("jdn-popup__button_primary", "jdn-popup__button_disabled");
          buttonOk.setAttribute("disabled", true);
        }
      };

      // here the validity check is runned
      input.addEventListener("blur", (event) => {
        checkInput(event.target);
      });
      input.addEventListener("input", (event) => {
        checkInput(event.target);
      });
    };

    wrapper = document.createElement("div");
    wrapper.setAttribute("id", "jdn-popup-wrapper");

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
    heading.innerHTML = "Rename page object";
    modal.appendChild(heading);

    const main = document.createElement("div");
    main.classList.add("jdn-popup__main");
    modal.appendChild(main);

    const form = document.createElement("form");
    form.setAttribute("novalidate", true);
    form.onsubmit = (event) => {
      event.preventDefault();
      onFormSubmit(event);
    };
    main.appendChild(form);

    const labelName = document.createElement("label");
    labelName.classList.add("jdn-edit-popup__label");
    labelName.classList.add("jdn-popup__label");
    labelName.innerHTML = "Name:";
    form.appendChild(labelName);

    const inputName = document.createElement("input");
    inputName.setAttribute("name", "name");
    inputName.setAttribute("required", true);
    inputName.value = name;
    const errorIcon = document.createElement("i");
    errorIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 
    1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13ZM7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 
    3.13401 0 7C0 10.866 3.13401 14 7 14Z" fill="#D82C15"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.58136 4.58136C4.68984 4.47288 4.86572 4.47288 4.97419 
    4.58136L9.41864 9.0258C9.52712 9.13428 9.52712 9.31016 9.41864 9.41864C9.31016 9.52712 9.13428 9.52712 9.02581 
    9.41864L4.58136 4.9742C4.47288 4.86572 4.47288 4.68984 4.58136 4.58136Z" fill="#D82C15" stroke="#D82C15" 
    stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.41864 4.58136C9.31016 4.47288 9.13428 4.47288 9.02581 
    4.58136L4.58136 9.0258C4.47288 9.13428 4.47288 9.31016 4.58136 9.41864C4.68984 9.52712 4.86572 9.52712 4.97419 
    9.41864L9.41864 4.9742C9.52712 4.86572 9.52712 4.68984 9.41864 4.58136Z" fill="#D82C15" stroke="#D82C15" 
    stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const nameError = document.createElement("div");
    nameError.classList.add("jdn-input-message");
    labelName.append(inputName, errorIcon, nameError);
    addValidation(inputName, "jdn-input-error", nameError, getNameValidationMessage);

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
    wrapper.append(backgroundModal);
    document.body.append(wrapper);
  };

  chrome.storage.onChanged.addListener((event) => {
    const newValue = event?.OPEN_EDIT_NAME?.newValue;
    if (newValue?.isOpen === true) {
      chrome.runtime.sendMessage({
        message: "IS_OPEN_MODAL",
        param: true,
      });
      showDialog(newValue.value);
    }
    if (event?.IS_DISCONNECTED?.newValue === true) {
      removePopup();
    }
  });
};
