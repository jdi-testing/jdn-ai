import { uniq, compact } from "lodash";
import { HttpEndpoint } from "../services/backend";

export const defaultClass = "UIElement";

const HTML5classes = {
  button: "Button",
  checkbox: "Checkbox",
  checklist: "Checklist",
  colorpicker: "ColorPicker",
  datalist: "Combobox",
  datetimeselector: "DateTimeSelector",
  dropdown: "Dropdown",
  fileinput: "FileInput",
  label: "TextField",
  link: "Link",
  multidropdown: "MultiSelector",
  multiselector: "MultiSelector",
  numberselector: "NumberSelector",
  progressbar: "ProgressBar",
  radiobutton: defaultClass,
  radiobuttongroup: "RadioButtons",
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
  list: "List",
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

export const elementLibrary = {
  MUI: "MUI",
  HTML5: "HTML5",
};

export const defaultLibrary = elementLibrary.MUI;

export const libraryNames = {
  [elementLibrary.MUI]: "Material UI",
  [elementLibrary.HTML5]: "HTML 5",
};

export const libraryClasses = {
  [elementLibrary.MUI]: MUIclasses,
  [elementLibrary.HTML5]: HTML5classes,
};

export const predictEndpoints = {
  [elementLibrary.MUI]: HttpEndpoint.MUI_PREDICT,
  [elementLibrary.HTML5]: HttpEndpoint.HTML5_PREDICT,
};

export const getJDILabel = (label, library) => libraryClasses[library][label] || defaultClass;

export const getJdiClassName = (label, library) => {
  let jdiClass = getJDILabel(label, library);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};

export const getTypesMenuOptions = (library) => compact(uniq(
    Object.values(libraryClasses[library]).map((value) => {
      if (value !== defaultClass) return value;
    }).sort()
));
