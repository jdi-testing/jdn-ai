import React from "react";
import { Col, Row, TourStepProps } from "antd5";
import { OnbrdStep } from "../types/constants";
import { StepRef } from "../types/context.types";
import Link from "antd/lib/typography/Link";
import { CloudCheck, DesktopTower } from "phosphor-react";

const newPageObject = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Begin using JDN",
  description: "You can create a Page Object of the current web page by clicking on this button.",
  target: refs[OnbrdStep.NewPageObject]?.target?.current,
  nextButtonProps: {
    children: "Create Page Object",
    onClick: refs[OnbrdStep.NewPageObject]?.onClickNext,
  },
});

const poSettings = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Basic settings",
  description:
    "At the start of the creation process, you can specify certain characteristics of the Page Object locators for your convenience. Later you can modify these characteristics.",
  target: refs[OnbrdStep.POsettings]?.target?.current,
  prevButtonProps: {
    onClick: refs[OnbrdStep.POsettings]?.onClickPrev,
  },
});

const generate = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Start creating",
  description:
    "After clicking this button, the page will be scanned and locators will be generated. Please make sure that you have opened the required web page before proceeding.",
  target: refs[OnbrdStep.Generate]?.target?.current,
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

const customLocator = (refs: Record<OnbrdStep, StepRef>, isCustomLocatorFlow: boolean) => ({
  title: "Create Custom locator",
  description:
    "If the JDN has not recognized all the necessary elements on the web page, you can create a custom locator.",
  target: refs[OnbrdStep.CustomLocator]?.target?.current,
  prevButtonProps: {
    style: { display: "none" },
  },
  nextButtonProps: {
    children: isCustomLocatorFlow ? "Create custom locator" : "Next",
    onClick: refs[OnbrdStep.CustomLocator]?.onClickNext,
  },
});

const createCustomLocator = (refs: Record<OnbrdStep, StepRef>) => {
  const onClick = refs[OnbrdStep.EditLocator]?.onClickNext;
  return {
    title: "Creating the Custom locator",
    description: "Fill in all the fields and add the new locator to the list",
    target: refs[OnbrdStep.EditLocator]?.target?.current,
    prevButtonProps: {
      onClick: refs[OnbrdStep.EditLocator]?.onClickPrev,
    },
    nextButtonProps: {
      children: "Add to the list",
      onClick,
      ...(onClick ? {} : { disabled: true }),
    },
  };
};

const contextMenu = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Context menu",
  description:
    'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu. \n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
  target: refs[OnbrdStep.EditLocator]?.target?.current,
});

const addToPO = (refs: Record<OnbrdStep, StepRef>, isCustomLocatorFlow?: boolean) => ({
  title: "Add the locator to the Page Object",
  description:
    "Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.",
  target: refs[OnbrdStep.AddToPO]?.target?.current,
  prevButtonProps: {
    style: { display: isCustomLocatorFlow ? "none" : "inline-block" },
  },
  nextButtonProps: {
    disabled: true,
  },
});

const saveLocators = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Finish creating the Page Object",
  description: "Save your selections.",
  target: refs[OnbrdStep.SaveLocators]?.target?.current,
  nextButtonProps: {
    children: "Save Page Object",
    onClick: refs[OnbrdStep.SaveLocators]?.onClickNext,
  },
});

const downloadPO = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Download",
  description:
    "After saving the required locators, the Page Object is ready. \n You can download all Page Objects as a .zip file.",
  target: refs[OnbrdStep.DownloadPO]?.target?.current,
  prevButtonProps: {
    onClick: refs[OnbrdStep.DownloadPO]?.onClickPrev,
  },
});

const editPO = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Context menu",
  description:
    "In the context menu, you can edit, rename or delete the Page Object, copy all locators from it, or download the Page Object as a .java file.",
  target: refs[OnbrdStep.EditPO]?.target?.current,
});

const onboarding = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Onboarding tutorial",
  description: "Provides step-by-step instructions on how to use JDN. You can always go through it again if needed.",
  target: refs[OnbrdStep.Onboarding]?.target?.current,
});

const readme = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "ReadMe",
  description: (
    <React.Fragment>
      This section contains useful information about JDN and its features. Additionally, we have our own{" "}
      <Link href="https://www.youtube.com/watch?v=b2o6R98icRU" target="_blank">
        YouTube channel
      </Link>{" "}
      with instructional videos.
    </React.Fragment>
  ),
  target: refs[OnbrdStep.Readme]?.target?.current,
});

const report = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Report a problem",
  description: "Allows you to report any issues you encounter while using JDN. Your feedback is very important to us!",
  target: refs[OnbrdStep.Report]?.target?.current,
});

const connection = (refs: Record<OnbrdStep, StepRef>) => ({
  title: "Connection to the server",
  description: (
    <React.Fragment>
      Displays the current type of connection being used by JDN, whether it&apos;s a local server or a cloud server.
      <Col className="jdn__onboarding_connection">
        <Row>
          <CloudCheck size={16} color="#8C8C8C" /> &ndash; you are connected to a cloud server
        </Row>
        <Row>
          <DesktopTower size={16} color="#8C8C8C" /> &ndash; you are connected to a local server
        </Row>
      </Col>
    </React.Fragment>
  ),
  target: refs[OnbrdStep.Connection]?.target?.current,
});

export const createPOSteps = (refs: Record<OnbrdStep, StepRef>) => [
  newPageObject(refs),
  poSettings(refs),
  generate(refs),
  creating(),
];

export const addLocatorsSteps = (refs: Record<OnbrdStep, StepRef>, isCustomLocatorFlow: boolean) => {

  return [
    customLocator(refs, isCustomLocatorFlow),
    isCustomLocatorFlow ? createCustomLocator(refs) : contextMenu(refs),
    addToPO(refs, isCustomLocatorFlow),
    saveLocators(refs),
  ];
};

export const finishSteps = (refs: Record<OnbrdStep, StepRef>) => [
  downloadPO(refs),
  editPO(refs),
  onboarding(refs),
  readme(refs),
  report(refs),
  connection(refs),
];

export const getPOPageSteps = (refs: Record<OnbrdStep, StepRef>, isCustomLocatorFlow: boolean): TourStepProps[] => {
  const addPrevButtonChilds = (step: TourStepProps) => ({
    ...step,
    prevButtonProps: {
      children: "Back",
      ...step.prevButtonProps,
    },
  });

  // use "as TourStepProps[]" because {nextButtonProps: { disabled: boolean }} is not a documented feature
  return ([
    ...createPOSteps(refs),
    ...addLocatorsSteps(refs, isCustomLocatorFlow),
    ...finishSteps(refs),
  ] as TourStepProps[]).map(addPrevButtonChilds);
};
