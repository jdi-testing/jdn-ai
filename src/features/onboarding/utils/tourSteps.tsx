import { TourProps } from "antd5";
import { OnbrdStepName } from "../types/constants";
import { StepRef } from "../types/context.types";

export const getPOPageSteps = (refs: Record<OnbrdStepName, StepRef>): TourProps["steps"] => {
  const createPOSteps = (refs: Record<OnbrdStepName, StepRef>) => [
    {
      title: "Begin using JDN",
      description: "You can create a Page Object of the current web page by clicking on this button.",
      target: () => refs[OnbrdStepName.NewPageObject]?.target.current,
      nextButtonProps: {
        children: "Create Page Object",
        onClick: refs[OnbrdStepName.NewPageObject]?.onClickNext,
      },
    },
    {
      title: "Basic settings",
      description:
        "At the start of the creation process, you can specify certain characteristics of the Page Object locators for your convenience. Later you can modify these characteristics.",
      target: () => refs[OnbrdStepName.POsettings]?.target.current,
    },
    {
      title: "Start creating",
      description:
        "After clicking this button, the page will be scanned and locators will be generated. Please make sure that you have opened the required web page before proceeding.",
      target: () => refs[OnbrdStepName.Generate]?.target.current,
      nextButtonProps: {
        children: "Generate",
        onClick: refs[OnbrdStepName.Generate]?.onClickNext,
      },
    },
    {
      title: "Creating locators...",
    },
  ];

  const addLocatorsSteps = (refs: Record<OnbrdStepName, StepRef>) => [
    {
      title: "Create Custom locator",
      description:
        "If the JDN has not recognized all the necessary elements on the web page, you can create a custom locator.",
      target: () => refs[OnbrdStepName.CustomLocator]?.target.current,
    },
    {
      title: "Context menu",
      description:
        'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu. \n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
      target: () => refs[OnbrdStepName.ContextMenu]?.target.current,
    },
    {
      title: "Add the locator to the Page Object",
      description:
        "Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.",
      target: () => refs[OnbrdStepName.AddToPO]?.target.current,
    },
    {
      title: "Finish creating the Page Object",
      description: "Save your selections.",
      target: () => refs[OnbrdStepName.SaveLocators]?.target.current,
      nextButtonProps: {
        children: "Save PO",
        onClick: refs[OnbrdStepName.SaveLocators]?.onClickNext,
      },
    },
  ];

  const finishSteps = (refs: Record<OnbrdStepName, StepRef>) => [
    {
      title: "Download",
      description:
        "After saving the required locators, the Page Object is ready. \n You can download all Page Objects as a .zip file.",
      target: () => refs[OnbrdStepName.DownloadPO]?.target.current,
    },
    {
      title: "Context menu",
      description:
        "In the context menu, you can edit, rename or delete the Page Object, copy all locators from it, or download the Page Object as a .java file.",
      target: () => refs[OnbrdStepName.EditPO]?.target.current,
    },
    {
      title: "Onboarding tutorial",
      description:
        "Provides step-by-step instructions on how to use JDN. You can always go through it again if needed.",
      target: () => refs[OnbrdStepName.Onboarding]?.target.current,
    },
    {
      title: "ReadMe",
      description:
        "This section contains useful information about JDN and its features. Additionally, we have our own YouTube channel with instructional videos.",
      target: () => refs[OnbrdStepName.Readme]?.target.current,
    },
    {
      title: "Report a problem",
      description:
        "Allows you to report any issues you encounter while using JDN. Your feedback is very important to us!",
      target: () => refs[OnbrdStepName.Report]?.target.current,
    },
    {
      title: "Connection to the server",
      description:
        "Displays the current type of connection being used by JDN, whether it's a local server or a cloud server.",
      target: () => refs[OnbrdStepName.Connection]?.target.current,
    },
  ];

  return [...createPOSteps(refs), ...addLocatorsSteps(refs), ...finishSteps(refs)];
};
