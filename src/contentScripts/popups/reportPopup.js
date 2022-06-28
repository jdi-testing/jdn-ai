export const reportPopup = () => {
  const ATTACHMENT_PAGE_ID = "jdn-page";
  const ATTACHMENT_SNAPSHOT_ID = "jdn-screenshot";
  const ATTACHMENT_PAGE_NAME = "page.json";
  const ATTACHMENT_SNAPSHOT_NAME = "screenshot.png";

  const INPUT_ELEMENT = {
    INPUT: "INPUT",
    TEXTAREA: "TEXTAREA",
  };

  const ERROR_TYPE = {
    EMPTY_VALUE: "EMPTY_VALUE",
    INVALID_EMAIL: "INVALID_EMAIL",
  };

  const ERROR_MESSAGE = {
    [ERROR_TYPE.EMPTY_VALUE]: "Please fill out this field.",
    [ERROR_TYPE.INVALID_EMAIL]: "Invalid email.",
  };

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  const longTextError = (number) => `Max length is ${number} characters.`;

  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", "jdn-popup-wrapper");

  const background = document.createElement("div");
  background.classList.add("jdn-popup-bg");

  const modal = document.createElement("dialog");
  modal.classList.add("jdn-popup", "jdn-report-popup");

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
    main.remove();
    wrapper.style.display = "none";

    Promise.all([capture(), requestPageData()]).then((results) => {
      const [frame, pageData] = results;
      wrapper.style.display = "block";
      createForm(frame, pageData);
    });
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

  function createAttachmentBox(fileName, id, content) {
    const downloadSvg = `<svg width="10" height="13" viewBox="0 0 10 13" fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <path d="M8.06004 4.98535H7.00004V1.65202C7.00004 1.28535 6.70004 0.985352 6.33337 0.985352H3.66671C3.30004 
    0.985352 3.00004 1.28535 3.00004 1.65202V4.98535H1.94004C1.34671 4.98535 1.04671 5.70535 1.46671 6.12535L4.52671 
    9.18535C4.78671 9.44535 5.20671 9.44535 5.46671 9.18535L8.52671 6.12535C8.94671 5.70535 8.65337 4.98535 8.06004 
    4.98535ZM0.333374 11.652C0.333374 12.0187 0.633374 12.3187 1.00004 12.3187H9.00004C9.36671 12.3187 9.66671 12.0187 
    9.66671 11.652C9.66671 11.2854 9.36671 10.9854 9.00004 10.9854H1.00004C0.633374 10.9854 0.333374 11.2854 0.333374 
    11.652Z" fill="#D9D9D9"/>
    </svg>`;

    const clipSvg = `<svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.33329 3.15202V9.86035C6.33329 11.1495 5.28913 12.1937 3.99996 12.1937C2.71079 12.1937 1.66663 11.1495 
    1.66663 9.86035V2.56868C1.66663 1.76368 2.31996 1.11035 3.12496 1.11035C3.92996 1.11035 4.58329 1.76368 4.58329 
    2.56868V8.69368C4.58329 9.01452 4.32079 9.27702 3.99996 9.27702C3.67913 9.27702 3.41663 9.01452 3.41663 
    8.69368V3.15202H2.54163V8.69368C2.54163 9.49868 3.19496 10.152 3.99996 10.152C4.80496 10.152 5.45829 9.49868 
    5.45829 8.69368V2.56868C5.45829 1.27952 4.41413 0.235352 3.12496 0.235352C1.83579 0.235352 0.791626 1.27952 
    0.791626 2.56868V9.86035C0.791626 11.6337 2.22663 13.0687 3.99996 13.0687C5.77329 13.0687 7.20829 11.6337 
    7.20829 9.86035V3.15202H6.33329Z" fill="#D9D9D9"/>
    </svg>`;

    const attachmentBox = document.createElement("a");
    attachmentBox.classList.add("jdn-popup__button", "jdn-popup__button_tertiary", "jdn-popup__attachment");
    id && attachmentBox.setAttribute("id", id);
    attachmentBox.href = content;
    attachmentBox.download = fileName;

    const clipIcon = document.createElement("i");
    clipIcon.classList.add("jdn-popup__attachment-icon", "jdn-popup__attachment-icon-left");
    clipIcon.innerHTML = clipSvg;

    const downloadIcon = document.createElement("i");
    downloadIcon.classList.add("jdn-popup__attachment-icon", "jdn-popup__attachment-icon-right");
    downloadIcon.innerHTML = downloadSvg;

    const fileDiv = document.createElement("div");
    fileDiv.innerText = fileName;

    attachmentBox.append(clipIcon, fileDiv, downloadIcon);
    return attachmentBox;
  }

  function createForm(frame, pageData) {
    const createInputField = (labelText, inputName, inputType, inputElement, isRequired, getValidationMessage) => {
      const label = document.createElement("label");
      label.classList.add("jdn-popup__label", "jdn-edit-popup__label");
      label.innerHTML = labelText;

      const input = document.createElement(inputType);
      input.setAttribute("name", inputName);

      const errorIcon = document.createElement("i");
      errorIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 
        1C3.68629 
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

      return { label, input };
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

        // format Save button
        if (emailInput.validity.valid && subjectInput.validity.valid && descriptionInput.validity.valid) {
          sendButton.classList.replace("jdn-popup__button_disabled", "jdn-popup__button_primary");
          sendButton.removeAttribute("disabled");
        } else {
          sendButton.classList.replace("jdn-popup__button_primary", "jdn-popup__button_disabled");
          sendButton.setAttribute("disabled", true);
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

    const getLengthValidation = (maxLength) => ({ value }) => {
      if (value.length > maxLength) return longTextError(maxLength);
    };

    const mainContainer = document.createElement("div");
    mainContainer.classList.add("jdn-popup__main");

    const form = document.createElement("form");
    form.setAttribute("novalidate", true);
    form.onsubmit = (event) => {
      const { target } = event;
      event.preventDefault();
      sendReportProblemData(target, frame);
      removePopup();
    };

    const { label: emailLabel, input: emailInput } = createInputField(
        "Your e-mail:",
        "email",
        INPUT_ELEMENT.INPUT,
        true,
        getEmailValidationMessage
    );
    const { label: subjectLabel, input: subjectInput } = createInputField(
        "Title:",
        "subject",
        INPUT_ELEMENT.INPUT,
        false,
        getLengthValidation(200)
    );
    const { label: descriptionLabel, input: descriptionInput } = createInputField(
        "Describe your<br>problem:",
        "description",
        INPUT_ELEMENT.TEXTAREA,
        true,
        getLengthValidation(1000)
    );

    const screenshotBox = createAttachmentBox(ATTACHMENT_SNAPSHOT_NAME, ATTACHMENT_SNAPSHOT_ID, frame);

    const pageDataBox = createAttachmentBox(
        ATTACHMENT_PAGE_NAME,
        ATTACHMENT_PAGE_ID,
        window.URL.createObjectURL(new Blob([pageData]))
    );

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("jdn-popup__button-container");

    const sendButton = document.createElement("button");
    sendButton.classList.add("jdn-popup__button", "jdn-popup__button_disabled");
    sendButton.setAttribute("disabled", true);
    sendButton.setAttribute("type", "submit");
    sendButton.innerText = "Send";

    buttonContainer.append(cancelButton, sendButton);

    mainContainer.appendChild(form);
    form.append(emailLabel, subjectLabel, descriptionLabel, screenshotBox, pageDataBox, buttonContainer);
    modal.append(mainContainer);
  }

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

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        context.drawImage(video, 0, 0, window.outerWidth, window.outerHeight);
        frame = canvas.toDataURL("image/png");
        captureStream.getTracks().forEach((track) => track.stop());
        resolve(frame);
      };
    });
  }

  function requestPageData() {
    return sendMessage({
      message: "GET_PAGE_DATA_JSON",
    });
  }

  function removePopup() {
    wrapper.remove();
  }

  function sendReportProblemData({ email, subject, description }, frame) {
    sendMessage({
      message: "SEND_PROBLEM_REPORT",
      param: {
        from: email.value,
        subject: subject.value,
        body: description.value,
        screenshot: frame,
      },
    });
  }
};
