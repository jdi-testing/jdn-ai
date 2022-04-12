export const reportPopup = () => {
  let frame;

  const INPUT_ELEMENT = {
    INPUT: "INPUT",
    TEXTAREA: "TEXTAREA",
  };

  const ERROR_TYPE = {
    EMPTY_VALUE: "EMPTY_VALUE",
    INVALID_EMAIL: "INVALID_EMAIL",
    // LONG_NAME: "LONG_NAME",
  };

  const ERROR_MESSAGE = {
    [ERROR_TYPE.EMPTY_VALUE]: "Please fill out this field.",
    [ERROR_TYPE.INVALID_EMAIL]: "Invalid email.",
    // [ERROR_TYPE.LONG_NAME]: "Max name length is 60 characters.",
  };

  const longTextError = (number) => `Max length is ${number} characters.`;

  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", "jdn-popup-wrapper");

  const background = document.createElement("div");
  background.classList.add("jdn-popup-bg");

  const modal = document.createElement("dialog");
  modal.classList.add("jdn-popup", "jdn-report-popup", "jdn-edit-popup");

  const header = document.createElement("h4");
  header.classList.add("jdn-popup__header");
  header.innerText = "Report Problem";

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&#215;";
  closeButton.classList.add("jdn-popup__button_close");
  closeButton.onclick = removePopup;

  const main = document.createElement("div");
  main.classList.add("jdn-popup__main");

  const description = document.createElement("p");
  description.innerHTML = `
        To find the real problem, we need to get a screenshot 
        of the site with the identified elements on it. <br> <br>

        To take a screenshot you need: <br>
            - press the OK button in this window <br>
            - select the <b>'Chrome tab'</b> tab in the newly appeared window <br>
            - select the ${document.title} <br>
            - click the 'Share' button <br><br>
    `;

  const okButton = document.createElement("button");
  okButton.classList.add("jdn-popup__button", "jdn-popup__button_primary");
  okButton.innerText = "Ok";

  okButton.addEventListener("click", () => {
    // removePopup();
    capture();
    main.remove();
    createForm();
  });

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("jdn-popup__button");
  cancelButton.classList.add("jdn-popup__button_tertiary");
  cancelButton.innerText = "Cancel";
  cancelButton.onclick = removePopup;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("jdn-popup__button-container");
  buttonContainer.append(cancelButton);
  buttonContainer.append(okButton);

  main.append(description);
  main.append(buttonContainer);

  modal.append(header);
  modal.append(closeButton);
  modal.append(main);

  background.append(modal);
  wrapper.append(background);
  document.body.append(wrapper);

  chrome.storage.onChanged.addListener((event) => {
    if (event?.IS_DISCONNECTED?.newValue === true && modal) {
      removePopup();
    }
  });

  function createForm() {
    const createInputField = (labelText, inputName, inputElement, isRequired, getValidationMessage) => {
      const label = document.createElement("label");
      label.classList.add("jdn-popup__label", "jdn-edit-popup__label");
      label.innerHTML = labelText;
      // form.appendChild(label);
      const input = document.createElement(inputElement);
      input.setAttribute("name", inputName);

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

      const errorText = document.createElement("div");
      errorText.classList.add("jdn-input-message");
      label.append(input, errorIcon, errorText);

      addValidation(input, "jdn-input-error", errorText, getValidationMessage, isRequired);

      return label;
    };

    const addValidation = (input, invalidInputClass, messageContainer, getErrorMessage, isRequired) => {
      const checkInput = async (targetInput) => {
        if (isRequired && targetInput.value.length === 0) {
          targetInput.setCustomValidity(ERROR_MESSAGE[ERROR_TYPE.EMPTY_VALUE]);
        } else if (getErrorMessage) {
          const message = await getErrorMessage(targetInput);
          targetInput.setCustomValidity(message || "");
        } else targetInput.setCustomValidity("");

        messageContainer.innerHTML = targetInput.validationMessage || "";
        input.checkValidity();

        // format input
        if (!targetInput.validity.valid) {
          targetInput.classList.add(invalidInputClass);
        } else {
          targetInput.classList.remove(invalidInputClass);
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

    const getEmailValidationMessage = (target) => {
      const { value } = target;
      const emailRegexp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      const isValidEmail = emailRegexp.test(value);
      if (!isValidEmail) return ERROR_MESSAGE[ERROR_TYPE.INVALID_EMAIL];
      return getLengthValidation(200)(target);
    };

    const getLengthValidation = (maxLength) => ({value}) => {
      if (value.length > maxLength) return longTextError(maxLength);
    };

    const mainContainer = document.createElement("div");
    mainContainer.classList.add("jdn-popup__main");

    const form = document.createElement("form");
    form.setAttribute("novalidate", true);
    form.onsubmit = (event) => {
      const { target } = event;
      event.preventDefault();
      sendReportProblemData(target);
      console.log("submit");
      removePopup();
    };

    mainContainer.appendChild(form);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("jdn-popup__button-container");

    const sendButton = document.createElement("button");
    sendButton.classList.add("jdn-popup__button", "jdn-popup__button_disabled");
    sendButton.setAttribute("disabled", true);
    sendButton.setAttribute("type", "submit");
    sendButton.innerText = "Send";
    buttonContainer.appendChild(sendButton);

    const emailInput = createInputField("Email:", "email", INPUT_ELEMENT.INPUT, true, getEmailValidationMessage);
    const subjectInput = createInputField("Subject:", "subject", INPUT_ELEMENT.INPUT, false, getLengthValidation(200));
    const descriptionInput = createInputField(
        "Describe<br>your problem:",
        "description",
        INPUT_ELEMENT.TEXTAREA,
        true,
        getLengthValidation(1000)
    );

    form.appendChild(emailInput);
    form.appendChild(subjectInput);
    form.appendChild(descriptionInput);

    form.append(buttonContainer);
    modal.append(mainContainer);

    // format Save button
    if (emailInput.validity.valid && subjectInput.validity.valid && descriptionInput.validity.valid) {
      sendButton.classList.replace("jdn-popup__button_disabled", "jdn-popup__button_primary");
      sendButton.removeAttribute("disabled");
    } else {
      sendButton.classList.replace("jdn-popup__button_primary", "jdn-popup__button_disabled");
      sendButton.setAttribute("disabled", true);
    }
  };

  async function capture() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const video = document.createElement("video");

    video.width = window.outerWidth;
    video.height = window.outerHeight;

    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;

    const captureStream = await navigator.mediaDevices.getDisplayMedia();
    video.srcObject = captureStream;

    video.onloadedmetadata = () => {
      video.play();
      context.drawImage(video, 0, 0, window.outerWidth, window.outerHeight);
      frame = canvas.toDataURL("image/png");
      captureStream.getTracks().forEach((track) => track.stop());

      console.log("load image");
    };
  }

  function removePopup() {
    wrapper.remove();
  }

  function sendReportProblemData({ email }) {
    chrome.runtime.sendMessage({
      message: "REPORT_PROBLEM",
      param: {
        email: email.value,
        subject: "string",
        body: "string",
        screenshot: frame,
      },
    });
  }

  console.log("report");
};
