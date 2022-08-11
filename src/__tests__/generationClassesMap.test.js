import { elementLibrary, getJdiClassName, getJDILabel, getTypesMenuOptions } from "../utils/generationClassesMap";

const options = [
  { label: "accordion", jdi: "Accordion" },
  { label: "badge", jdi: "Badge" },
  { label: "bottom-navigation", jdi: "BottomNavigation" },
  { label: "breadcrumbs", jdi: "Breadcrumbs" },
  { label: "button", jdi: "Button" },
  { label: "button-group", jdi: "ButtonGroup" },
  { label: "checkbox", jdi: "Checkbox" },
  { label: "chip", jdi: "Chip" },
  { label: "dialog", jdi: "Dialog" },
  { label: "drawer", jdi: "Drawer" },
  { label: "link", jdi: "Link" },
  { label: "list", jdi: "List" },
  { label: "menu", jdi: "Menu" },
  { label: "progress", jdi: "ProgressBar" },
  { label: "radiogroup", jdi: "RadioButtons" },
  { label: "select", jdi: "Select" },
  { label: "slider", jdi: "Slider" },
  { label: "snackbar", jdi: "Snackbar" },
  { label: "stepper", jdi: "Stepper" },
  { label: "switch", jdi: "Switch" },
  { label: "table", jdi: "Table" },
  { label: "tabs", jdi: "Tabs" },
  { label: "textarea-autosize", jdi: "TextArea" },
  { label: "text-field", jdi: "TextField" },
];

describe("Get JDI class by predicted label", () => {
  test("get 'Badge' for 'badge", () => {
    const res = getJDILabel("badge", elementLibrary.MUI);
    expect(res).toBe("Badge");
  });

  test("get 'UIElement' for 'anyUnsupportedClass", () => {
    const res = getJDILabel("anyUnsupportedClass", elementLibrary.MUI);
    expect(res).toBe("UIElement");
  });

  test("get 'Breadcrumbs' for 'breadcrumbs'", () => {
    expect(getJdiClassName("breadcrumbs", elementLibrary.MUI)).toBe("Breadcrumbs");
  });

  test("get 'UIElement (anyType)' for 'anyType'", () => {
    expect(getJdiClassName("anyType", elementLibrary.MUI)).toBe("UIElement (anyType)");
  });

  test("get 'UIElement (undefined)' for 'undefined'", () => {
    expect(getJdiClassName(undefined, elementLibrary.MUI)).toBe("UIElement (undefined)");
  });

  test("get types", () => {
    expect(getTypesMenuOptions(elementLibrary.MUI)).toStrictEqual(options);
  });
});
