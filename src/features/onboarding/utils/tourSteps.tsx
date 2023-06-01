import { TourProps } from "antd5";
import { OnbrdControl } from "../types/constants";
import { StepRef } from "../types/context.types";

export const getTourSteps = (refs: Record<OnbrdControl, StepRef>): TourProps["steps"] => {
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
  ];
};
