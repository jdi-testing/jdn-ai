export const settingsPopup = () => {
  const checkboxes = [
    {
      name: 'allow_indexes_at_the_beginning',
      label: 'Allow indexes at the beginning',
      tooltip: `Let generate locators with indexes (such as @UI("//[1]/[@Class='breadcrumb']")) at the beginning`,
    },
    {
      name: 'allow_indexes_in_the_middle',
      label: 'Allow indexes at the middle',
      tooltip: `Let generate locators with indexes (such as @UI("//*[@class='items_16']/*[1]/*/*")) in the middle`
    },
    {
      name: 'allow_indexes_at_the_end',
      label: 'Allow indexes at the end',
      tooltip: `Let generate locators with indexes (such as @UI("//*[@class='legal']/*[3]")) at the end`
    },
    {
      name: 'limit_maximum_generation_time',
      label: 'Limit generation time of one locator to',
      tooltip: `Generate best locator for given time frame`
    },
  ];

  chrome.storage.sync.get(['XPATH_CONFIG'], ({XPATH_CONFIG}) => {
    const {xpathConfig, elementIds, hasGeneratedSelected} = XPATH_CONFIG;
    chrome.runtime.sendMessage({
      message: "IS_OPEN_MODAL",
      param: true,
    });
    const settings = xpathConfig;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "jdn-popup-wrapper");

    const background = document.createElement("div");
    background.classList.add("jdn-popup-bg");

    const modal = document.createElement("dialog");
    modal.setAttribute('open', true);
    modal.classList.add("jdn-popup");
    modal.classList.add("jdn-settings-popup");

    const header = document.createElement('h4');
    header.classList.add('jdn-popup__header');
    header.innerHTML = 'Settings';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = "&#215;";
    closeButton.classList.add('jdn-popup__button_close');
    closeButton.onclick = removePopup;

    const main = document.createElement("div");
    main.classList.add("jdn-popup__main");

    const form = document.createElement('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({
        message: "CHANGE_XPATH_SETTINGS",
        param: {settings, elementIds},
      });
      removePopup();
    };

    checkboxes.forEach(((checkbox) => {
      const inputContainer = document.createElement('div');
      inputContainer.className = 'jdn-settings-popup__input-container';

      const {name, label} = checkbox;
      const formCheckbox = document.createElement('input');
      formCheckbox.setAttribute('type', 'checkbox');
      formCheckbox.setAttribute('name', name);

      const hintIcon = document.createElement('span');
      hintIcon.className = 'jdn-hint-icon';
      hintIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="7" fill="#B2B5C2"/>
          <path d="M5.92731 7.95201C5.92731 7.6409 5.99265 7.37957 6.12331 7.16801C6.25398
          6.95645 6.47798 6.73556 6.79531 6.50534C7.07531 6.30623 7.27442 6.13512 7.39265 5.99201C7.51709
          5.84268 7.57931 5.66845 7.57931 5.46934C7.57931 5.27023 7.50465 5.1209 7.35531 5.02134C7.2122
          4.91556 7.00998 4.86268 6.74865 4.86268C6.48731 4.86268 6.22909 4.90312 5.97398 4.98401C5.71887
          5.0649 5.45753 5.17379 5.18998 5.31068L4.69531 4.31201C5.0002 4.14401 5.32998 4.00712 5.68465
          3.90134C6.03931 3.79556 6.4282 3.74268 6.85131 3.74268C7.49842 3.74268 7.99931 3.89823 8.35398
          4.20934C8.71487 4.52045 8.89531 4.91556 8.89531 5.39468C8.89531 5.64979 8.85487 5.87068 8.77398
          6.05734C8.69309 6.24401 8.57176 6.41823 8.40998 6.58001C8.2482 6.73556 8.04598 6.90356 7.80331
          7.08401C7.62287 7.21468 7.48287 7.32668 7.38331 7.42001C7.28376 7.51334 7.21531 7.60356 7.17798
          7.69068C7.14687 7.77779 7.13131 7.88668 7.13131 8.01734V8.28801H5.92731V7.95201ZM5.77798
          9.84668C5.77798 9.56045 5.85576 9.36134 6.01131 9.24934C6.16687 9.13112 6.35665 9.07201
          6.58065 9.07201C6.79842 9.07201 6.98509 9.13112 7.14065 9.24934C7.2962 9.36134 7.37398 9.56045
          7.37398 9.84668C7.37398 10.1205 7.2962 10.3196 7.14065 10.444C6.98509 10.5622 6.79842 10.6213
          6.58065 10.6213C6.35665 10.6213 6.16687 10.5622 6.01131 10.444C5.85576 10.3196 5.77798 10.1205
          5.77798 9.84668Z" fill="black"/>
        </svg>
    `;
      const tooltip = document.createElement('span');
      tooltip.className = 'jdn-tooltip--light';
      tooltip.innerHTML = checkbox.tooltip;
      hintIcon.append(tooltip);

      if (settings[name] === true) {
        formCheckbox.setAttribute('checked', true);
      } else if (settings[name] === "indeterminate") {
        formCheckbox.classList.add("jdn-indeterminate");
      }

      const checkboxLabel = document.createElement('label');
      checkboxLabel.innerHTML = label;
      checkboxLabel.classList.add('jdn-settings-popup__label');
      checkboxLabel.classList.add("jdn-popup__label");
      checkboxLabel.append(formCheckbox);

      formCheckbox.addEventListener("change", (event) => {
        event.preventDefault();

        if (formCheckbox.classList.value.includes("jdn-indeterminate")) {
          formCheckbox.classList.remove("jdn-indeterminate");
        }
        settings[event.target.name] = event.target.checked;
      });
      inputContainer.append(checkboxLabel);

      if (name === 'limit_maximum_generation_time') {
        const numberInput = document.createElement('input');
        numberInput.classList.add('jdn-settings-popup__input');
        numberInput.setAttribute('type', 'number');
        numberInput.setAttribute('name', 'maximum_generation_time');
        numberInput.setAttribute('min', 0);
        numberInput.setAttribute('step', 1);
        numberInput.setAttribute('value', settings.maximum_generation_time);
        numberInput.addEventListener("change", (event) => {
          event.preventDefault();
          settings[event.target.name] = parseInt(event.target.value, 10);
        });

        const numberInputLabel = document.createElement('label');
        numberInputLabel.classList.add('jdn-settings-popup__label');
        numberInputLabel.classList.add("jdn-popup__label");
        numberInputLabel.innerHTML = 'sec';
        numberInputLabel.append(numberInput);
        inputContainer.append(numberInputLabel);
      }
      inputContainer.append(hintIcon);
      form.append(inputContainer);
    }));

    const okButton = document.createElement("button");
    okButton.classList.add("jdn-popup__button");
    okButton.classList.add("jdn-popup__button_primary");
    okButton.setAttribute('type', 'submit');
    okButton.innerText = hasGeneratedSelected ? "Save and regenerate": "Save";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("jdn-popup__button");
    cancelButton.classList.add("jdn-popup__button_tertiary");
    cancelButton.innerText = "Cancel";
    cancelButton.onclick = removePopup;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("jdn-popup__button-container");

    buttonContainer.append(cancelButton);
    buttonContainer.append(okButton);

    form.append(buttonContainer);
    main.append(form);

    modal.append(header);
    modal.append(closeButton);
    modal.append(main);

    background.append(modal);
    wrapper.append(background);
    document.body.append(wrapper);

    chrome.storage.onChanged.addListener((event) => {
      if (event?.IS_DISCONNECTED?.newValue === true) {
        removePopup();
      };
    });

    function removePopup() {
      chrome.runtime.sendMessage({
        message: "IS_OPEN_MODAL",
        param: false,
      });
      background.remove();
      modal.remove();
    }
  });
};
