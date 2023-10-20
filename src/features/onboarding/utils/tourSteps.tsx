import React from 'react';
import { Col, Row, TourStepProps } from 'antd';
import { OnboardingStep } from '../types/constants';
import { StepRef } from '../types/context.types';
import Link from 'antd/lib/typography/Link';
import { CloudCheck, DesktopTower } from '@phosphor-icons/react';

const newPageObject = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Begin using JDN',
  description: 'You can create a Page Object of the current web page by clicking on this button.',
  target: refs[OnboardingStep.NewPageObject]?.target?.current,
  nextButtonProps: {
    children: 'Create Page Object',
    onClick: refs[OnboardingStep.NewPageObject]?.onClickNext,
  },
});

const poSettings = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Basic settings',
  description: `At the start of the creation process, you can specify certain characteristics of the Page Object 
    locators for your convenience.Later you can modify these characteristics.`,
  target: refs[OnboardingStep.POsettings]?.target?.current,
  prevButtonProps: {
    onClick: refs[OnboardingStep.POsettings]?.onClickPrev,
  },
});

const isGenerated = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Start creating',
  description: `After clicking this button, the page will be scanned and locators will be generated.
    Please make sure that you have opened the required web page before proceeding.
        
    Also, you can create an Empty Page Object and then select the elements you need for generation.`,
  target: refs[OnboardingStep.Generate]?.target?.current,
  nextButtonProps: {
    children: 'Generate',
    onClick: refs[OnboardingStep.Generate]?.onClickNext,
  },
});

const creating = () => ({
  title: 'Creating locators...',
  nextButtonProps: {
    disabled: true,
  },
  prevButtonProps: {
    disabled: true,
  },
});

const customLocator = (refs: Record<OnboardingStep, StepRef>, isCustomLocatorFlow: boolean) => ({
  title: 'Create Custom locator',
  description:
    'If the JDN has not recognized all the necessary elements on the web page, you can create a custom locator.',
  target: refs[OnboardingStep.CustomLocator]?.target?.current,
  prevButtonProps: {
    style: { display: 'none' },
  },
  nextButtonProps: {
    children: isCustomLocatorFlow ? 'Create custom locator' : 'Next',
    onClick: refs[OnboardingStep.CustomLocator]?.onClickNext,
  },
});

const createCustomLocator = (refs: Record<OnboardingStep, StepRef>) => {
  const onClick = refs[OnboardingStep.EditLocator]?.onClickNext;
  return {
    title: 'Creating the Custom locator',
    description: 'Fill in all the fields and add the new locator to the list',
    target: refs[OnboardingStep.EditLocator]?.target?.current,
    prevButtonProps: {
      onClick: refs[OnboardingStep.EditLocator]?.onClickPrev,
    },
    nextButtonProps: {
      children: 'Add to the list',
      onClick,
      ...(onClick ? {} : { disabled: true }),
    },
  };
};

const contextMenu = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Context menu',
  description:
    'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu.' +
    '\n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
  target: refs[OnboardingStep.EditLocator]?.target?.current,
});

const addToPO = (refs: Record<OnboardingStep, StepRef>, isCustomLocatorFlow?: boolean) => ({
  title: 'Add the locator to the Page Object',
  description:
    'Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.',
  target: refs[OnboardingStep.AddToPO]?.target?.current,
  prevButtonProps: {
    style: { display: isCustomLocatorFlow ? 'none' : 'inline-block' },
  },
  nextButtonProps: {
    disabled: true,
  },
});

const saveLocators = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Finish creating the Page Object',
  description: 'Save your selections.',
  target: refs[OnboardingStep.SaveLocators]?.target?.current,
  nextButtonProps: {
    children: 'Save Page Object',
    onClick: refs[OnboardingStep.SaveLocators]?.onClickNext,
  },
});

const downloadPO = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Download',
  description:
    'After saving the required locators, the Page Object is ready. \n You can download all Page Objects as a .zip file.',
  target: refs[OnboardingStep.DownloadPO]?.target?.current,
  prevButtonProps: {
    onClick: refs[OnboardingStep.DownloadPO]?.onClickPrev,
  },
});

const editPO = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Context menu',
  description:
    'In the context menu, you can edit, rename or delete the Page Object, copy all locators from it, or download the Page Object as a .java file.',
  target: refs[OnboardingStep.EditPO]?.target?.current,
});

const onboarding = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Onboarding tutorial',
  description: 'Provides step-by-step instructions on how to use JDN. You can always go through it again if needed.',
  target: refs[OnboardingStep.Onboarding]?.target?.current,
});

const readme = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'ReadMe',
  description: (
    <React.Fragment>
      This section contains useful information about JDN and its features. Additionally, we have our own{' '}
      <Link href="https://www.youtube.com/watch?v=b2o6R98icRU" target="_blank">
        YouTube channel
      </Link>{' '}
      with instructional videos.
    </React.Fragment>
  ),
  target: refs[OnboardingStep.Readme]?.target?.current,
});

const report = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Report a problem',
  description: 'Allows you to report any issues you encounter while using JDN. Your feedback is very important to us!',
  target: refs[OnboardingStep.Report]?.target?.current,
});

const connection = (refs: Record<OnboardingStep, StepRef>) => ({
  title: 'Connection to the server',
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
  target: refs[OnboardingStep.Connection]?.target?.current,
});

export const createPOSteps = (refs: Record<OnboardingStep, StepRef>) => [
  newPageObject(refs),
  poSettings(refs),
  isGenerated(refs),
  creating(),
];

export const addLocatorsSteps = (refs: Record<OnboardingStep, StepRef>, isCustomLocatorFlow: boolean) => {
  return [
    customLocator(refs, isCustomLocatorFlow),
    isCustomLocatorFlow ? createCustomLocator(refs) : contextMenu(refs),
    addToPO(refs, isCustomLocatorFlow),
    saveLocators(refs),
  ];
};

export const finishSteps = (refs: Record<OnboardingStep, StepRef>) => [
  downloadPO(refs),
  editPO(refs),
  onboarding(refs),
  readme(refs),
  report(refs),
  connection(refs),
];

export const getPOPageSteps = (refs: Record<OnboardingStep, StepRef>, isCustomLocatorFlow: boolean): TourStepProps[] => {
  const addPrevButtonChilds = (step: TourStepProps) => ({
    ...step,
    prevButtonProps: {
      children: 'Back',
      ...step.prevButtonProps,
    },
  });

  // use "as TourStepProps[]" because {nextButtonProps: { disabled: boolean }} is not a documented feature
  return (
    [...createPOSteps(refs), ...addLocatorsSteps(refs, isCustomLocatorFlow), ...finishSteps(refs)] as TourStepProps[]
  ).map(addPrevButtonChilds);
};
