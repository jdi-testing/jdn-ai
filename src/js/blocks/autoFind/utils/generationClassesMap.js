export const defaultClass = "UIElement";

// const JDIBasicClasses = {
//   button: "Button",
//   link: "Link",
//   iframe: defaultClass,
//   textfield: "TextField",
//   dropdown: "Dropdown",
//   checkbox: "Checkbox",
//   textarea: "TextArea",
//   label: "Label",
//   text: "Text",
//   fileinput: "FileInput",
//   image: "Image",
//   colorpicker: defaultClass,
//   range: defaultClass,
//   progressbar: defaultClass,
//   datetimeselector: defaultClass,
//   numberselector: defaultClass,
//   dropdownselector: "Dropdown selector",
//   checklist: "CheckList",
//   radiobutton: "RadioButtons",
//   table: "Table",
// };

const MUIclasses = {
  ["app-bar"]: "UIElement",
  avatar: "Avatar",
  backdrop: "UIElement",
  badge: "Badge",
  box: "UIElement",
  card: "List<Text>",
  checkbox: "Checkbox",
  chip: "Chip",
  container: "UIElement",
  dialog: "UIElement",
  divider: "Divider",
  icon: "UIElement",
  radio: "Button",
  radiogroup: "List<Button>",
  stepper: "WebList",
  slider: "Slider",
  tabs: "List<Button>",
  table: "Table",
  typography: "Text",
  ["datetime-picker"]: "Dropdown",
  switch: "Checkbox",
  button: "Button",
  ["button-group"]: "ButtonGroup",
  grid: "UIElement",
  drawer: "Drawer",
  breadcrumbs: "UIElement",
  ["bottom-navigation"]: "BottomNavigation",
  paper: "UIElement",
  accordion: "Accordion",
  portal: "UIElement",
  ["textarea-autosize"]: "TextArea",
  popover: "UIElement",
  popper: "UIElement",
  progress: "ProgressBar",
  link: "Link",
  menu: "Menu",
  list: "Lists",
  ["text-field"]: "TextField",
  alert: "UIElement",
  snackbar: "Text",
};

export const JDIclasses = MUIclasses;

export const getJDILabel = (label) => JDIclasses[label] || label;

export const getJdiClassName = (label) => {
  let jdiClass = getJDILabel(label);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};
