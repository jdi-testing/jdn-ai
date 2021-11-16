export const downloadPopup = () => {
  chrome.runtime.sendMessage({
    message: "IS_OPEN_DOWNLOAD_POPUP",
    param: true,
  });

  const background = document.createElement("div");
  background.classList.add("jdn-popup-bg");

  const modal = document.createElement("dialog");
  modal.setAttribute('open', true);
  modal.classList.add("jdn-popup");
  modal.classList.add("download-popup");

  const header = document.createElement('h4');
  header.classList.add('jdn-popup__header');
  header.innerHTML = 'Download';

  const closeButton = document.createElement('button');
  closeButton.innerHTML = "&#215;";
  closeButton.classList.add('jdn-popup__button_close');
  closeButton.onclick = removePopup;

  const main = document.createElement('div');
  main.classList.add("jdn-popup__main");
  main.innerHTML = `
    <strong class="download-popup__warning">Attention!</strong>
    Not all selected locators have already been <br>
    generated. We recommend waiting until the generation is complete.
    <br>
  `;

  const downloadGeneratedButton = document.createElement("button");
  downloadGeneratedButton.classList.add("jdn-popup__button");
  downloadGeneratedButton.classList.add("jdn-popup__button_primary");
  downloadGeneratedButton.innerText = "Download generated";
  downloadGeneratedButton.onclick = downloadGenerated;

  const downloadAllButton = document.createElement("button");
  downloadAllButton.classList.add("jdn-popup__button");
  downloadAllButton.classList.add("jdn-popup__button_secondary");
  downloadAllButton.innerText = "Download all";
  downloadAllButton.onclick = downloadAll;

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("jdn-popup__button");
  cancelButton.classList.add("jdn-popup__button_tertiary");
  cancelButton.innerText = "Cancel";
  cancelButton.onclick = removePopup;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("jdn-popup__button-container");
  buttonContainer.append(cancelButton);
  buttonContainer.append(downloadAllButton);
  buttonContainer.append(downloadGeneratedButton);

  main.append(buttonContainer);

  modal.append(header);
  modal.append(closeButton);
  modal.append(main);

  background.append(modal);
  document.body.append(background);

  function removePopup() {
    chrome.runtime.sendMessage({
      message: "IS_OPEN_DOWNLOAD_POPUP",
      param: false,
    });
    background.remove();
    modal.remove();
  }

  function downloadAll() {
    chrome.runtime.sendMessage({
      message: "DOWNLOAD_POPUP",
      param: 'all'
    });
    background.remove();
    modal.remove();
  }

  function downloadGenerated() {
    chrome.runtime.sendMessage({
      message: "DOWNLOAD_POPUP",
      param: 'generated'
    });
    background.remove();
    modal.remove();
  }
};
