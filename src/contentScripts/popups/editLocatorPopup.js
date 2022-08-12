export const editLocatorPopup = () => {
  let backgroundModal;
  let modal;
  let wrapper;

  const ERROR_TYPE = {
    DUPLICATED_NAME: "DUPLICATED_NAME",
    DUPLICATED_LOCATOR: "DUPLICATED_LOCATOR", // error
    EMPTY_VALUE: "EMPTY_VALUE",
    INVALID_NAME: "INVALID_NAME",
    MULTIPLE_ELEMENTS: "MULTIPLE_ELEMENTS", // warn
    NEW_ELEMENT: "NEW_ELEMENT", // error
    NOT_FOUND: "NOT_FOUND", // warn
  };

  const ERROR_MESSAGE = {
    [ERROR_TYPE.DUPLICATED_NAME]: "This name already exists in the page object.",
    [ERROR_TYPE.DUPLICATED_LOCATOR]: "The locator for this element already exists.",
    [ERROR_TYPE.EMPTY_VALUE]: "Please fill out this field.",
    [ERROR_TYPE.INVALID_NAME]: "This name is not valid.",
    [ERROR_TYPE.MULTIPLE_ELEMENTS]: "elements were found with this locator",
    [ERROR_TYPE.NEW_ELEMENT]: `The locator leads to the new element.`,
    [ERROR_TYPE.NOT_FOUND]: "The locator was not found on the page.",
  };

  const VALIDATION_CLASS = {
    ERROR: "jdn-input-error",
    WARNING: "jdn-input-warning",
  };

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  const WARNING_TYPES = [ERROR_TYPE.MULTIPLE_ELEMENTS, ERROR_TYPE.NOT_FOUND, ERROR_TYPE.EMPTY_VALUE];

  const warningIconHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" 
  xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.33111 1.27639C7.14685 0.907869 6.62095 0.907869 6.43669 
  1.27639L1.05472 12.0403C0.888497 12.3728 1.13024 12.7639 1.50194 12.7639H12.2659C12.6376 12.7639 12.8793 12.3728 
  12.7131 12.0403L7.33111 1.27639ZM5.54226 0.82918C6.09505 -0.276392 7.67276 -0.276394 8.22554 0.829179L13.6075 
  11.5931C14.1062 12.5905 13.3809 13.7639 12.2659 13.7639H1.50194C0.386863 13.7639 -0.338381 12.5905 0.160295 
  11.5931L5.54226 0.82918Z" fill="#F69A0E"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M6.97754 4.07617C7.39175 4.07617 7.72754 4.41196 7.72754 
  4.82617V8.57617C7.72754 8.99039 7.39175 9.32617 6.97754 9.32617C6.56333 9.32617 6.22754 8.99039 6.22754 
  8.57617V4.82617C6.22754 4.41196 6.56333 4.07617 6.97754 4.07617Z" fill="#F69A0E"/>
  <path d="M7.72754 10.9512C7.72754 11.3654 7.39175 11.7012 6.97754 11.7012C6.56333 11.7012 6.22754 11.3654 6.22754 
  10.9512C6.22754 10.537 6.56333 10.2012 6.97754 10.2012C7.39175 10.2012 7.72754 10.537 7.72754 10.9512Z" 
  fill="#F69A0E"/>
  </svg>`;

  const errorIconHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" 
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

  const getValidationClass = (errorType) =>
    WARNING_TYPES.includes(errorType) ? VALIDATION_CLASS.WARNING : VALIDATION_CLASS.ERROR;

  const removePopup = () => {
    sendMessage({
      message: "IS_OPEN_MODAL",
      param: false,
    });
    wrapper && wrapper.remove();
    chrome.storage.sync.set({ OPEN_EDIT_LOCATOR: { isOpen: false } });
  };

  const getLocatorValue = ({ customXpath, robulaXpath, fullXpath }) => customXpath || robulaXpath || fullXpath;

  const showDialog = (locatorElement, types) => {
    const { type, name, locator, element_id, jdnHash } = locatorElement;
    currentElement = element_id;

    const onFormSubmit = ({ target }) => {
      const { type: typeInput, name: nameInput, locator: locatorInput } = target;

      // if we do have any changes
      if (name !== nameInput.value || type !== typeInput.value || getLocatorValue(locator) !== locatorInput.value) {
        sendMessage({
          message: "UPDATE_LOCATOR",
          param: {
            element_id: element_id,
            type: typeInput.value,
            name: nameInput.value,
            locator: locatorInput.value,
            validity: {
              locator: inputLocator.validationMessage,
            },
          },
        });
      }

      removePopup();
    };

    const getNameValidationMessage = ({ value }) => {
      const isValidJavaVariable = /^[a-zA-Z_$]([a-zA-Z0-9_])*$/.test(value);
      if (!isValidJavaVariable) return ERROR_TYPE.INVALID_NAME;

      return sendMessage({
        message: "CHECK_NAME_VALIDITY",
        param: {
          element_id,
          newName: value,
        },
      });
    };

    const getLocatorValidationMessage = ({ value }) => {
      if (!value.length) return ERROR_TYPE.EMPTY_VALUE;
      let nodesSnapshot;
      try {
        nodesSnapshot = document.evaluate(value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      } catch (error) {
        return ERROR_TYPE.NOT_FOUND;
      }
      if (nodesSnapshot.snapshotLength === 0) {
        return ERROR_TYPE.NOT_FOUND;
      } else if (nodesSnapshot.snapshotLength > 1) {
        return `${nodesSnapshot.snapshotLength} ${ERROR_TYPE.MULTIPLE_ELEMENTS}`;
      } else if (nodesSnapshot.snapshotLength === 1) {
        const foundElement = nodesSnapshot.snapshotItem(0);
        const foundHash = foundElement.getAttribute("jdn-hash");
        if (foundHash !== jdnHash) {
          return new Promise((resolve) => {
            sendMessage(
                {
                  message: "CHECK_LOCATOR_VALIDITY",
                  param: { foundHash },
                },
                (response) => resolve(response)
            );
          });
        }
      } else return "";
    };

    const addValidation = (input, messageContainer, getErrorMessage) => {
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
        targetInput.classList.remove(VALIDATION_CLASS.ERROR);
        targetInput.classList.remove(VALIDATION_CLASS.WARNING);

        if (!targetInput.validity.valid) {
          targetInput.classList.add(
            targetInput.name === "name" ? VALIDATION_CLASS.ERROR : getValidationClass(targetInput.validationMessage)
          );
        }

        // format Save button
        if (
          inputName.validity.valid &&
          (inputLocator.validity.valid ||
            WARNING_TYPES.includes(inputLocator.validationMessage)) // disable Save button only for errors
        ) {
          buttonOk.classList.replace("jdn-popup__button_disabled", "jdn-popup__button_primary");
          buttonOk.removeAttribute("disabled");
        } else {
          buttonOk.classList.replace("jdn-popup__button_primary", "jdn-popup__button_disabled");
          buttonOk.setAttribute("disabled", true);
        }
      };

      checkInput(input);

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
    heading.innerHTML = "Edit";
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

    const labelType = document.createElement("label");
    labelType.classList.add("jdn-edit-popup__label");
    labelType.classList.add("jdn-popup__label");
    labelType.innerHTML = "Block type:";
    form.appendChild(labelType);

    const selectType = document.createElement("select");
    selectType.classList.add("jdn-edit-popup__select");
    selectType.setAttribute("name", "type");
    labelType.appendChild(selectType);

    const isJdiType = types.find((_type) => _type.jdi === type);
    if (!isJdiType) {
      const option = document.createElement("option");
      option.setAttribute("selected", true);
      option.setAttribute("value", type);
      option.innerHTML = type;
      selectType.appendChild(option);
    }

    types.forEach(({ label, jdi }) => {
      const option = document.createElement("option");
      option.setAttribute("value", label);
      option.innerHTML = jdi;
      if (isJdiType && jdi === type) option.setAttribute("selected", true);
      selectType.appendChild(option);
    });

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
    errorIcon.classList.add("jdn-error-icon");
    errorIcon.innerHTML = errorIconHTML;

    const nameError = document.createElement("div");
    nameError.classList.add("jdn-input-message");
    labelName.append(inputName, errorIcon, nameError);
    addValidation(inputName, nameError, getNameValidationMessage);

    const labelLocator = document.createElement("label");
    labelLocator.classList.add("jdn-edit-popup__label");
    labelLocator.classList.add("jdn-popup__label");
    labelLocator.innerHTML = "Locator:";
    form.appendChild(labelLocator);

    const inputLocator = document.createElement("textarea");
    inputLocator.setAttribute("name", "locator");
    inputLocator.setAttribute("rows", "5");
    inputLocator.setAttribute("cols", "30");
    inputLocator.value = getLocatorValue(locator);

    const warningIcon = document.createElement("i");
    warningIcon.classList.add("jdn-warning-icon");
    warningIcon.innerHTML = warningIconHTML;

    const errorLocatorIcon = document.createElement("i");
    errorLocatorIcon.classList.add("jdn-error-icon");
    errorLocatorIcon.innerHTML = errorIconHTML;

    const locatorError = document.createElement("div");
    locatorError.classList.add("jdn-input-message");
    labelLocator.append(inputLocator, warningIcon, errorLocatorIcon, locatorError);
    addValidation(inputLocator, locatorError, getLocatorValidationMessage);

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
    const newValue = event?.OPEN_EDIT_LOCATOR?.newValue;
    if (newValue?.isOpen === true) {
      sendMessage({
        message: "IS_OPEN_MODAL",
        param: true,
      });
      showDialog(newValue.value, newValue.types);
    }
    if (event?.IS_DISCONNECTED?.newValue === true) {
      removePopup();
    }
  });
};
