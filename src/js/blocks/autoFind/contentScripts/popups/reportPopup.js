export const reportPopup = () => {
  const background = document.createElement("div");
  background.classList.add("jdn-popup-bg");

  const modal = document.createElement("div");
  modal.classList.add("jdn-popup");
  modal.classList.add("jdn-report-popup");

  const header = document.createElement("h4");
  header.classList.add('jdn-popup__header');
  header.innerText = "Report Problem";

  const closeButton = document.createElement('button');
  closeButton.innerHTML = "&#215;";
  closeButton.classList.add('jdn-popup__button_close');
  closeButton.onclick = removePopup;

  const main = document.createElement("div");
  main.classList.add("jdn-popup__main");

  const description = document.createElement("p");
  description.innerHTML = `
        To find the real problem, we need to get the txt-file (json.txt)
        and a screenshot of the site with the identified elements on it (screenshot.jpg). <br> <br>

        To take a screenshot and get the json file, you need: <br>
            - press the OK button in this window <br>
            - select the 'Chrome tab' tab in the newly appeared window <br>
            - select the ${document.title} <br>
            - click the 'Share' button <br><br>

        After that, send a letter in which you describe the problem and attach the downloaded files.
    `;

  const okButton = document.createElement("button");
  okButton.classList.add("jdn-popup__button");
  okButton.classList.add("jdn-popup__button_primary");
  okButton.innerText = "Ok";

  okButton.addEventListener("click", () => {
    removePopup();

    const capture = async () => {
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
        const frame = canvas.toDataURL("image/png");
        captureStream.getTracks().forEach((track) => track.stop());

        chrome.storage.sync.get(["predictedElements"], ({ predictedElements }) => {
          saveJson(JSON.stringify(predictedElements));
          saveImage(frame);
          mailTo();
        });
      };
    };

    capture();
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
  document.body.append(background);

  chrome.storage.onChanged.addListener((event) => {
    if (event?.IS_DISCONNECTED?.newValue === true && modal) {
      removePopup();
    }
  });

  function removePopup() {
    background.remove();
    modal.remove();
  }

  function mailTo() {
    const mailToLink = document.createElement("a");
    mailToLink.target = "_blank";
    mailToLink.href = `mailto:JDI-support+JDN@epam.com?subject=Some%20elements%20were%20not%20identified
    %20on%20page%3A%20${window.location.href}&body=Hi%2C%0D%0ASome%20elements%20were%20not%20identified%
    20on%20the%20page%2C%20please%20have%20a%20look.%0D%0A%3CPlease%20save%20provided%20archive%20to%20
    disk%20and%20attach%20it%20to%20this%20email%3E%0D%0A%3CPROVIDE%20ADDITIONAL%20DETAILS%20IF%20NEEDED%3E`;
    mailToLink.click();
  }

  function saveImage(frame) {
    const imageLink = document.createElement("a");
    imageLink.href = frame;
    imageLink.download = "screenshot.jpg";
    imageLink.click();
  }

  saveJson = (content) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "json.txt";
    a.click();
  };
};
