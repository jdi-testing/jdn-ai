export enum LocatorType {
  cssSelector = "CSS selector",
  xPath = "xPath",
}

export type SelectOption = {
  value: string | null;
  label: string | null;
};
