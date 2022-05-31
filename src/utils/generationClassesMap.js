import { sortBy } from "lodash";

export const defaultClass = "UIElement";

const HTML5classes = {
  button: "Button",
  checkbox: "Checkbox",
  checklist: "Checklist",
  colorpicker: "ColorPicker",
  datalist: "DataListOptions",
  datetimeselector: "DateTimeSelector",
  dropdown: "Dropdown",
  fileinput: "FileInput",
  label: "TextField",
  link: "Link",
  multidropdown: "MultiSelector",
  multiselector: "MultiSelector",
  numberselector: "NumberSelector",
  progressbar: "ProgressBar",
  radiobutton: "radiobutton",
  radiobuttongroup: "radiobuttongroup",
  range: "Range",
  table: "Table",
  text: "Text",
  textarea: "TextArea",
  textfield: "TextField",
  title: "Title",
};

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
  // radio: "RadioButtons",
  radiogroup: "RadioButtons",
  select: "Select",
  slider: "Slider",
  snackbar: "Snackbar",
  stepper: "Stepper",
  switch: "Switch",
  tabs: "Tabs",
  table: "Table",
  ["textarea-autosize"]: "TextArea",
  ["text-field"]: "TextField",
};

export const JDIclasses = [...HTML5classes, ...MUIclasses];

export const getJDILabel = (label) => JDIclasses[label] || defaultClass;

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
