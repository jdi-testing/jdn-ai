import { uniq, compact } from "lodash";
import { HttpEndpoint } from "../../../services/backend";

export const defaultClass = "UIElement";

enum HTML5classes {
  button = "Button",
  checkbox = "Checkbox",
  checklist = "Checklist",
  colorpicker = "ColorPicker",
  datalist = "Combobox",
  datetimeselector = "DateTimeSelector",
  dropdown = "Dropdown",
  fileinput = "FileInput",
  label = "TextField",
  link = "Link",
  multidropdown = "MultiSelector",
  multiselector = "MultiSelector",
  numberselector = "NumberSelector",
  progressbar = "ProgressBar",
  radiobuttongroup = "RadioButtons",
  range = "Range",
  table = "Table",
  text = "Text",
  textarea = "TextArea",
  textfield = "TextField",
  title = "Title",
}

enum MUIclasses {
  accordion ="Accordion",
  badge ="Badge",
  ["bottom-navigation"] ="BottomNavigation",
  button ="Button",
  ["button-group"] ="ButtonGroup",
  breadcrumbs ="Breadcrumbs",
  checkbox ="Checkbox",
  chip ="Chip",
  dialog ="Dialog",
  drawer ="Drawer",
  link ="Link",
  list ="List",
  menu ="Menu",
  progress ="ProgressBar",
  radiogroup ="RadioButtons",
  select ="Select",
  slider ="Slider",
  snackbar ="Snackbar",
  stepper ="Stepper",
  switch ="Switch",
  tabs ="Tabs",
  table ="Table",
  ["textarea-autosize"] ="TextArea",
  ["text-field"] ="TextField",
}

type ElementLabel = typeof MUIclasses | typeof HTML5classes | typeof defaultClass;
type ElementClass = MUIclasses | HTML5classes | typeof defaultClass;

export enum ElementLibrary {
  MUI,
  HTML5,
}

export const defaultLibrary = ElementLibrary.MUI;

export const libraryNames: Record<ElementLibrary, string> = {
  [ElementLibrary.MUI]: "Material UI",
  [ElementLibrary.HTML5]: "HTML 5",
};

export const libraryClasses: Record<ElementLibrary, typeof MUIclasses | typeof HTML5classes> = {
  [ElementLibrary.MUI]: MUIclasses,
  [ElementLibrary.HTML5]: HTML5classes,
};

export const predictEndpoints: Record<ElementLibrary, HttpEndpoint> = {
  [ElementLibrary.MUI]: HttpEndpoint.MUI_PREDICT,
  [ElementLibrary.HTML5]: HttpEndpoint.HTML5_PREDICT,
};

export const getJDILabel = (label: keyof ElementLabel, library: ElementLibrary): ElementClass => libraryClasses[library][label] || defaultClass;

export const getJdiClassName = (label: keyof ElementLabel, library: ElementLibrary) => {
  let jdiClass = getJDILabel(label, library);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};

export const getTypesMenuOptions = (library: ElementLibrary) => compact(uniq(
    Object.values(libraryClasses[library]).map((value) => {
      if (value !== defaultClass) return value;
    }).sort()
));
