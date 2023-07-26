export enum OnbrdStep {
  NewPageObject, //0
  POsettings, //1
  Generate, //2
  Generating, //3
  CustomLocator, //4
  EditLocator, //5
  AddToPO, //6
  SaveLocators, //7
  DownloadPO, //8
  EditPO, //9
  Onboarding, //10
  Readme, //11
  Report, //12
  Connection, //13
}

export enum OnboardingPopupText {
  Default = "Would you like to start the onboarding?",
  InProgress = "Your current progress will not be saved. Are you sure you want to start the onboarding?",
}

export enum OnboardingPopupButtons {
  Ok = "Start",
  Cancel = "No",
}

export enum OnboardingProviderTexts {
  ModalTitle = "Welcome to Onboarding Tutorial!",
  ModalText = "Discover all the features and possibilities of the extension with the onboarding tutorial.",
  ModalOkButtonText = "Start",
  ModalCancelButtonText = "Skip",
}
