import { sortBy } from "lodash";

export const defaultClass = "UIElement";

const MUIclasses = {
  accordion: "Accordion",
  // alert: "UIElement",
  badge: "Badge",
  ["bottom-navigation"]: "BottomNavigation",
  button: "Button",
  ["button-group"]: "ButtonGroup",
  breadcrumbs: "Breadcrumbs",
  checkbox: "Checkbox",
  chip: "Chip",
  dialog: "Dialog",
  drawer: "Drawer",
  link: "Link",
  list: "Lists",
  menu: "Menu",
  progress: "ProgressBar",
  radio: "RadioButtons",
  radiogroup: "RadioButtons",
  select: "Select",
  slider: "Slider",
  snackbar: "Text",
  stepper: "Stepper",
  switch: "Switch",
  tabs: "Tabs",
  table: "Table",
  ["textarea-autosize"]: "TextArea",
  ["text-field"]: "TextField",
};

export const JDIclasses = MUIclasses;

export const getJDILabel = (label) => JDIclasses[label] || label;

export const getJdiClassName = (label) => {
  let jdiClass = getJDILabel(label);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};

export const getTypesMenuOptions = () => sortBy(
    Object.keys(JDIclasses).map((label) => {
      return { label, jdi: getJdiClassName(label) };
    }),
    ["jdi"]
);
