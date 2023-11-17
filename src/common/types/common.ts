export enum FrameworkType {
  JdiLight = 'JDI Light',
  Selenium = 'Selenium',
  Selenide = 'Selenide',
  Vividus = 'Vividus',
}

export enum AnnotationType {
  UI = '@UI',
  FindBy = '@FindBy',
}

export enum LocatorType {
  cssSelector = 'CSS selector',
  xPath = 'xPath',
}

export const locatorAttributesInitialState = {
  className: null,
  id: null,
  linkText: null,
  name: null,
  tagName: null,
};

export type SelectOption = {
  value: string | null;
  label: string | null;
};

export enum CopyTitle {
  Copy = 'Copy',
  Copied = 'Copied',
}
