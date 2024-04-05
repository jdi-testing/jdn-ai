export enum FrameworkType {
  JdiLight = 'JDI Light',
  Selenium = 'Selenium',
  Selenide = 'Selenide',
  Vividus = 'Vividus',
}

export enum AnnotationType {
  UI = '@UI',
  FindBy = '@FindBy',
  NotApplicable = 'Not applicable',
}

export enum LocatorType {
  cssSelector = 'CSS Selector',
  xPath = 'xPath',
  id = 'id',
  name = 'name',
  tagName = 'tagName',
  className = 'className',
  linkText = 'linkText',
  dataAttributes = 'dataAttributes',
}

export const locatorTypes: { [key in LocatorType]: string } = {
  [LocatorType.cssSelector]: 'CSS Selector',
  [LocatorType.xPath]: 'xPath',
  [LocatorType.id]: 'id',
  [LocatorType.name]: 'name',
  [LocatorType.tagName]: 'tagName',
  [LocatorType.className]: 'className',
  [LocatorType.linkText]: 'linkText',
  [LocatorType.dataAttributes]: 'dataAttributes',
};

export interface ElementAttributes {
  id?: string | null;
  name?: string | null;
  tagName?: string | null;
  className?: string | null;
  linkText?: string | null;
  dataAttributes?: { [key: string]: string | null } | null;
}

export interface ExtendedElementAttributes extends ElementAttributes {
  cssSelector: string | null;
  xPath: string | null;
}

export const locatorAttributesInitialState: ElementAttributes = {
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
