/* eslint-disable max-len */
import { CloudCheck, DesktopTower } from '@phosphor-icons/react';
import { Col, Row, Spin } from 'antd';
import Link from 'antd/lib/typography/Link';
import React from 'react';

export enum OnboardingStep {
  NewPageObject, //0
  POsettings, //1
  Generate, //2
  Generating, //3
  CustomLocator, //4
  EditLocator, //5
  ContextMenu, //6
  AddToPO, //7
  SaveLocators, //8
  DownloadPO, //9
  EditPO, //10
  Onboarding, //11
  Readme, //12
  Report, //13
  Connection, //14
}

export type TNextButtonProps = {
  style?: { display: string };
  disabled?: boolean;
  children?: string;
  onClick?: () => void;
};

export type TPrevButtonProps = {
  style?: { display: string };
  disabled?: boolean;
  children?: string;
  onClick?: () => void;
};

export interface IOnboardingStep {
  order: OnboardingStep;
  title: string;
  description?: string | React.JSX.Element;
  target?: React.RefObject<HTMLElement> | null;
  nextButtonProps?: TNextButtonProps;
  prevButtonProps: TPrevButtonProps;
}

export interface IOnboardingSteps {
  [key: string]: IOnboardingStep;
}

export const onboardingSteps: IOnboardingSteps = {
  NewPageObject: {
    order: OnboardingStep.NewPageObject,
    title: 'Begin using JDN',
    description: 'You can create a Page Object of the current web page by clicking on this button.',
    target: undefined,
    nextButtonProps: {
      children: 'Create Page Object',
      onClick: undefined,
    },
    prevButtonProps: {
      children: 'Back',
    },
  },
  POsettings: {
    order: OnboardingStep.POsettings,
    title: 'Basic settings',
    description: (
      <>
        <p style={{ marginBottom: '0px' }}>
          At the start of the creation process, you can specify certain characteristics of the Page Object locators for
          your convenience.
        </p>
        <p>Later you can modify these characteristics.</p>
      </>
    ),
    target: undefined,
    nextButtonProps: {
      onClick: undefined,
    },
    prevButtonProps: {
      children: 'Back',
    },
  },
  Generate: {
    order: OnboardingStep.Generate,
    title: 'Start creating',
    description: (
      <>
        <p>
          After clicking this button, the page will be scanned and locators will be generated. Please make sure that you
          have opened the required web page before proceeding.
        </p>
        <p>Also, you can create an Empty Page Object and then select the elements you need for generation.</p>
      </>
    ),
    target: undefined,
    nextButtonProps: {
      children: 'Generate',
      onClick: undefined,
    },
    prevButtonProps: {
      children: 'Back',
    },
  },
  Generating: {
    order: OnboardingStep.Generating,
    title: 'Creating locators...',
    description: (
      <>
        <Spin style={{ display: 'block' }} />
      </>
    ),
    target: undefined,
    nextButtonProps: {
      disabled: true,
      style: { display: 'none' },
    },
    prevButtonProps: {
      children: 'Back',
      disabled: true,
      style: { display: 'none' },
    },
  },
  CustomLocator: {
    order: OnboardingStep.CustomLocator,
    title: 'Create Custom locator',
    description: `No elements were found on this page. 
      You can go back and change the library settings or create a Custom locator.`,
    target: undefined,
    prevButtonProps: {
      children: 'Back',
      style: { display: 'none' },
    },
    nextButtonProps: {
      children: undefined,
      onClick: undefined,
    },
  },
  EditLocator: {
    order: OnboardingStep.EditLocator,
    title: 'Creating the Custom locator',
    description: 'Fill in all the fields and add the new locator to the list',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
      onClick: undefined,
      disabled: false,
    },
    nextButtonProps: {
      children: 'Add to the list',
      onClick: undefined,
      disabled: true,
    },
  },
  ContextMenu: {
    order: OnboardingStep.ContextMenu,
    title: 'Context menu',
    description:
      'You can modify the name, type, or locator itself by selecting the "Edit" option from the context menu.' +
      '\n Additionally, you can copy an already optimized locator in your preferred format by accessing the context menu or by right-clicking on the locator.',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
      style: { display: 'inline-block' },
    },
  },
  AddToPO: {
    order: OnboardingStep.AddToPO,
    title: 'Add the locator to the Page Object',
    description:
      'Select the needed locators (or choose all of them) to create the final Page object. Note that only selected locators will be added to the final Locators List.',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
      style: undefined,
    },
    nextButtonProps: {
      disabled: true,
    },
  },
  SaveLocators: {
    order: OnboardingStep.SaveLocators,
    title: 'Finish creating the Page Object',
    description: 'Save your selections.',
    target: undefined,
    nextButtonProps: {
      children: 'Save Page Object',
      onClick: undefined,
    },
    prevButtonProps: {
      children: 'Back',
    },
  },
  DownloadPO: {
    order: OnboardingStep.DownloadPO,
    title: 'Download',
    description:
      'After saving the required locators, the Page Object is ready. \n You can download all Page Objects as a .zip file.',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
      style: { display: 'none' },
    },
  },
  EditPO: {
    order: OnboardingStep.EditPO,
    title: 'Context menu',
    description:
      'In the context menu, you can edit, rename or delete the Page Object, copy all locators from it, or download the Page Object as a .java file.',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
    },
  },
  Onboarding: {
    order: OnboardingStep.Onboarding,
    title: 'Onboarding tutorial',
    description: 'Provides step-by-step instructions on how to use JDN. You can always go through it again if needed.',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
    },
  },
  Readme: {
    order: OnboardingStep.Readme,
    title: 'ReadMe',
    description: (
      <>
        This section contains useful information about JDN and its features. Additionally, we have our own{' '}
        <Link href="https://www.youtube.com/watch?v=b2o6R98icRU" target="_blank">
          YouTube channel
        </Link>{' '}
        with instructional videos.
      </>
    ),
    target: undefined,
    nextButtonProps: {
      onClick: undefined,
    },
    prevButtonProps: {
      children: 'Back',
    },
  },
  Report: {
    order: OnboardingStep.Report,
    title: 'Report a problem',
    description:
      'Allows you to report any issues you encounter while using JDN. Your feedback is very important to us!',
    target: undefined,
    prevButtonProps: {
      children: 'Back',
    },
  },
  Connection: {
    order: OnboardingStep.Connection,
    title: 'Server connection type',
    description: (
      <>
        Displays the current type of connection being used by JDN, whether it`&apos;`s the local server or the cloud
        server.
        <Col className="jdn__onboarding_connection">
          <Row>
            <CloudCheck size={16} color="#8C8C8C" /> &ndash; you are connected to the cloud server
          </Row>
          <Row>
            <DesktopTower size={16} color="#8C8C8C" /> &ndash; you are connected to the local server
          </Row>
        </Col>
      </>
    ),
    prevButtonProps: {
      children: 'Back',
    },
    target: undefined,
  },
};

export const onboardingMap = new Map<OnboardingStep, IOnboardingStep>();

for (const key in onboardingSteps) {
  if (onboardingSteps.hasOwnProperty(key)) {
    const step = OnboardingStep[key as keyof typeof OnboardingStep];
    onboardingMap.set(step, onboardingSteps[key]);
  }
}

export enum OnboardingPopupText {
  Default = 'Would you like to start the onboarding?',
  InProgress = `Your Page Objects will be deleted and the current progress will not be saved.
  
  Are you sure you want to start the onboarding?`,
}

export enum OnboardingPopupButtons {
  Ok = 'Start',
  Cancel = 'No',
}

export enum OnboardingProviderTexts {
  ModalTitle = 'Welcome to Onboarding Tutorial!',
  ModalText = 'Discover all the features and possibilities of the extension with the onboarding tutorial.',
  ModalOkButtonText = 'Start',
  ModalCancelButtonText = 'Skip',
}
