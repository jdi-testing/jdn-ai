export enum FrameworkType {
  JdiLight = "JDI Light",
  Selenium = "Selenium",
  Selenide = "Selenide",
  Vividus = "Vividus",
}

export enum LocatorType {
  cssSelector = "CSS selector",
  xPath = "xPath",
}

export type SelectOption = {
  value: string | null;
  label: string | null;
};

export enum CopyTitle {
  Copy = "Copy",
  Copied = "Copied",
}
