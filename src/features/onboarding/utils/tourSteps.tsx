import { TourProps } from "antd5";
import { OnbrdControl } from "../types/constants";
import { StepRef } from "../types/context.types";

export const getPOPageSteps = (refs: Record<OnbrdControl, StepRef>): TourProps["steps"] => {
  return [
    {
      title: "Begin using JDN",
      description: "You can create a Page Object of the current web page by clicking on this button.",
      target: () => refs[OnbrdControl.NewPageObject]?.target.current,
      nextButtonProps: {
        children: "Create Page Object",
        onClick: refs[OnbrdControl.NewPageObject]?.onClickNext,
      },
    },
    {
      title: "Basic settings",
      description:
        "At the start of the creation process, you can specify certain characteristics of the Page Object locators for your convenience. Later you can modify these characteristics.",
      target: () => refs[OnbrdControl.POsettings]?.target.current,
    },
    {
      title: "Start creating",
      description:
        "After clicking this button, the page will be scanned and locators will be generated. Please make sure that you have opened the required web page before proceeding.",
      target: () => refs[OnbrdControl.Generate]?.target.current,
      nextButtonProps: {
        children: "Generate",
        onClick: refs[OnbrdControl.Generate]?.onClickNext,
      },
    },
  ];
};

export const getLocatorsPageSteps = (refs: Record<OnbrdControl, StepRef>): TourProps["steps"] => {
  return [
    {
      title: "Create Custom locator",
      description:
        "If the JDN has not recognized all the necessary elements on the web page, you can create a custom locator.",
      target: () => refs[OnbrdControl.CustomLocator]?.target.current,
    },
    {
      title: "Context menu",
      description:
        'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu. \n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
      target: () => refs[OnbrdControl.ContextMenu]?.target.current,
    },
    {
      title: "Add the locator to the Page Object",
      description:
        "Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.",
      target: () => refs[OnbrdControl.AddToPO]?.target.current,
    },
  ];
};
