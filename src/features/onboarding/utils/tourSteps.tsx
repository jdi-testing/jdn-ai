import { TourStepProps } from "antd5";
import { OnbrdStep } from "../types/constants";
import { StepRef } from "../types/context.types";

const NewPageObject = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Begin using JDN",
  description: "You can create a Page Object of the current web page by clicking on this button.",
  target: () => refs[OnbrdStep.NewPageObject]?.target.current,
  nextButtonProps: {
    children: "Create Page Object",
    onClick: refs[OnbrdStep.NewPageObject]?.onClickNext,
  },
});

const POsettings = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Basic settings",
  description:
    "At the start of the creation process, you can specify certain characteristics of the Page Object locators for your convenience. Later you can modify these characteristics.",
  target: () => refs[OnbrdStep.POsettings]?.target.current,
  prevButtonProps: {
    onClick: refs[OnbrdStep.POsettings]?.onClickPrev,
  },
});

const Generate = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Start creating",
  description:
    "After clicking this button, the page will be scanned and locators will be generated. Please make sure that you have opened the required web page before proceeding.",
  target: () => refs[OnbrdStep.Generate]?.target.current,
  nextButtonProps: {
    children: "Generate",
    onClick: refs[OnbrdStep.Generate]?.onClickNext,
  },
});

const creating = () => ({
  title: "Creating locators...",
  nextButtonProps: {
    disabled: true,
  },
  prevButtonProps: {
    disabled: true,
  },
});

const CustomLocator = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Create Custom locator",
  description:
    "If the JDN has not recognized all the necessary elements on the web page, you can create a custom locator.",
  target: () => refs[OnbrdStep.CustomLocator]?.target.current,
  prevButtonProps: {
    style: { display: "none" },
  },
});

const ContextMenu = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Context menu",
  description:
    'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu. \n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
  target: () => refs[OnbrdStep.ContextMenu]?.target.current,
});

const AddToPO = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Add the locator to the Page Object",
  description:
    "Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.",
  target: () => refs[OnbrdStep.AddToPO]?.target.current,
  nextButtonProps: {
    disabled: true,
  },
});

const SaveLocators = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Finish creating the Page Object",
  description: "Save your selections.",
  target: () => refs[OnbrdStep.SaveLocators]?.target.current,
  nextButtonProps: {
    children: "Save PO",
    onClick: refs[OnbrdStep.SaveLocators]?.onClickNext,
  },
});

const DownloadPO = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Download",
  description:
    "After saving the required locators, the Page Object is ready. \n You can download all Page Objects as a .zip file.",
  target: () => refs[OnbrdStep.DownloadPO]?.target.current,
  prevButtonProps: {
    onClick: refs[OnbrdStep.DownloadPO]?.onClickPrev,
  },
});

const EditPO = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Context menu",
  description:
    "In the context menu, you can edit, rename or delete the Page Object, copy all locators from it, or download the Page Object as a .java file.",
  target: () => refs[OnbrdStep.EditPO]?.target.current,
});

const Onboarding = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Onboarding tutorial",
  description: "Provides step-by-step instructions on how to use JDN. You can always go through it again if needed.",
  target: () => refs[OnbrdStep.Onboarding]?.target.current,
});

const Readme = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "ReadMe",
  description:
    "This section contains useful information about JDN and its features. Additionally, we have our own YouTube channel with instructional videos.",
  target: () => refs[OnbrdStep.Readme]?.target.current,
});

const Report = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Report a problem",
  description: "Allows you to report any issues you encounter while using JDN. Your feedback is very important to us!",
  target: () => refs[OnbrdStep.Report]?.target.current,
});

const Connection = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Connection to the server",
  description:
    "Displays the current type of connection being used by JDN, whether it's a local server or a cloud server.",
  target: () => refs[OnbrdStep.Connection]?.target.current,
});

export const createPOSteps = (refs: Record<OnbrdStep, StepRef>) => [
  NewPageObject(refs),
  POsettings(refs),
  Generate(refs),
  creating(),
];

export const addLocatorsSteps = (refs: Record<OnbrdStep, StepRef>) => [
  CustomLocator(refs),
  ContextMenu(refs),
  AddToPO(refs),
  SaveLocators(refs),
];

export const finishSteps = (refs: Record<OnbrdStep, StepRef>) => [
  DownloadPO(refs),
  EditPO(refs),
  Onboarding(refs),
  Readme(refs),
  Report(refs),
  Connection(refs),
];

export const getPOPageSteps = (refs: Record<OnbrdStep, StepRef>): TourStepProps[] => {
  const addPrevButtonChilds = (step: TourStepProps) => ({
    ...step,
    prevButtonProps: {
      children: "Back",
      ...step.prevButtonProps,
    },
  });

  // use "as TourStepProps[]" because {nextButtonProps: { disabled: boolean }} is not a documented feature
  return ([...createPOSteps(refs), ...addLocatorsSteps(refs), ...finishSteps(refs)] as TourStepProps[]).map(
    addPrevButtonChilds
  );
};
