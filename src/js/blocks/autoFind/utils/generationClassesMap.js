export const defaultClass = "UIElement";

export const JDIclasses = {
  button: "Button",
  link: "Link",
  iframe: defaultClass,
  textfield: "TextField",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  textarea: "TextArea",
  label: "Label",
  text: "Text",
  fileinput: "FileInput",
  image: "Image",
  colorpicker: defaultClass,
  range: defaultClass,
  progressbar: defaultClass,
  datetimeselector: defaultClass,
  numberselector: defaultClass,
  dropdownselector: "Dropdown selector",
  checklist: "CheckList",
  radiobutton: "RadioButtons",
  table: "Table",
};

export const getJDILabel = (label) => JDIclasses[label] || label;

export const getJdiClassName = (label) => {
  let jdiClass = getJDILabel(label);
  if (jdiClass === defaultClass) jdiClass += ` (${label})`;
  return jdiClass ? jdiClass : label;
};
