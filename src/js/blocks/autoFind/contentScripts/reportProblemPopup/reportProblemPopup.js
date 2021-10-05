export const reportProblemPopup = () => {
  function removePopup() {
    backgroundModal.remove();
    modal.remove();
  }

  function mailTo() {
    const mailToLink = document.createElement("a");
    mailToLink.target = "_blank";
    mailToLink.href = `mailto:JDI-support+JDN@epam.com?subject=Some%20elements%20were%20not%20identified%20on%20page%3A%20${window.location.href}&body=Hi%2C%0D%0ASome%20elements%20were%20not%20identified%20on%20the%20page%2C%20please%20have%20a%20look.%0D%0A%3CPlease%20save%20provided%20archive%20to%20disk%20and%20attach%20it%20to%20this%20email%3E%0D%0A%3CPROVIDE%20ADDITIONAL%20DETAILS%20IF%20NEEDED%3E`;
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

  const backgroundModal = document.createElement("div");
  backgroundModal.classList.add("jdn-report-problem-popup__background");

  const modal = document.createElement("div");
  modal.classList.add("jdn-report-problem-popup__modal");

  const title = document.createElement("h4");
  title.innerText = "Report Problem";

  const descriptionText = document.createElement("p");
  descriptionText.innerHTML = `
        To find the real problem, we need to get the txt-file (json.txt) and a screenshot of the site with the identified elements on it (screenshot.jpg). <br> <br>

        To take a screenshot and get the json file, you need: <br>
            - press the OK button in this window <br>
            - select the 'Chrome tab' tab in the newly appeared window <br>
            - select the ${document.title} <br>
            - click the 'Share' button <br><br>

        After that, send a letter in which you describe the problem and attach the downloaded files.
    `;

  const buttonOk = document.createElement("button");
  buttonOk.classList.add("jdn-report-problem-popup__button");
  buttonOk.classList.add("jdn-report-problem-popup__button--ok");
  buttonOk.innerText = "Ok";

  buttonOk.addEventListener("click", () => {
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

  const buttonCancel = document.createElement("button");
  buttonCancel.classList.add("jdn-report-problem-popup__button");
  buttonCancel.innerText = "Cancel";

  buttonCancel.addEventListener("click", () => removePopup());

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("jdn-report-problem-popup__button-container");
  buttonContainer.append(buttonCancel);
  buttonContainer.append(buttonOk);

  modal.append(title);
  modal.append(descriptionText);
  modal.append(buttonContainer);

  backgroundModal.append(modal);

  document.body.append(backgroundModal);
};
