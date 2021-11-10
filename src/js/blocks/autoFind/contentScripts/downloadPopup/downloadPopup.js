export const downloadPopup = () => {
  chrome.runtime.sendMessage({
    message: "IS_OPEN_DOWNLOAD_POPUP",
    param: true,
  });

  const modal = document.createElement("dialog");
  modal.setAttribute('open', true);
  modal.classList.add("jdn-settings-popup__modal");
  modal.style.width = '400px';

  const backgroundModal = document.createElement("div");
  backgroundModal.classList.add("jdn-report-problem-popup__background");

  const modalCloseButton = document.createElement('button');
  modalCloseButton.innerHTML = "&#215;";
  modalCloseButton.classList.add('jdn-settings-popup__modal__close-button');
  modalCloseButton.onclick = removePopup;
  modal.appendChild(modalCloseButton);

  const heading = document.createElement('h4');
  heading.innerHTML = 'Download';
  modal.appendChild(heading);

  const main = document.createElement('div');
  main.style.padding = '0 18px';
  // TODO: bold font
  main.innerHTML = `
    <strong style="color: #D82C15;">Attention!</strong>
    Not all selected locators have already been <br>
    generated. We recommend waiting until the generation is complete.
    <br>
  `;
  modal.appendChild(main);

  const downloadGeneratedButton = document.createElement("button");
  downloadGeneratedButton.classList.add("jdn-settings-popup__button--ok");
  downloadGeneratedButton.innerText = "Download generated";
  downloadGeneratedButton.onclick = downloadGenerated;

  const downloadAllButton = document.createElement("button");
  downloadAllButton.style.border = '1px solid #1582D8';
  downloadAllButton.style.color = '#1582D8';
  downloadAllButton.style.padding = '7px 15px';
  downloadAllButton.style.backgroundColor = 'black';
  downloadAllButton.style.borderRadius = '4px';
  downloadAllButton.innerText = "Download all";
  downloadAllButton.onclick = downloadAll;

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("jdn-report-problem-popup__button");
  cancelButton.innerText = "Cancel";
  cancelButton.onclick = removePopup;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("jdn-settings-popup__button-container");
  buttonContainer.style.padding = '0 18px';
  buttonContainer.append(cancelButton);
  buttonContainer.append(downloadAllButton);
  buttonContainer.append(downloadGeneratedButton);
  modal.appendChild(buttonContainer);

  backgroundModal.append(modal);
  document.body.append(backgroundModal);

  function removePopup() {
    chrome.runtime.sendMessage({
      message: "IS_OPEN_DOWNLOAD_POPUP",
      param: false,
    });
    backgroundModal.remove();
    modal.remove();
  }

  function downloadAll() {
    chrome.runtime.sendMessage({
      message: "DOWNLOAD_POPUP",
      param: 'all'
    });
    backgroundModal.remove();
    modal.remove();
  }

  function downloadGenerated() {
    chrome.runtime.sendMessage({
      message: "DOWNLOAD_POPUP",
      param: 'generated'
    });
    backgroundModal.remove();
    modal.remove();
  }
};
