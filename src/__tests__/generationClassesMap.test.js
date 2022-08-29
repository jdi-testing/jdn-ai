import { elementLibrary, getJdiClassName, getJDILabel, getTypesMenuOptions } from "../components/PageObjects/utils/generationClassesMap";

const optionsMUI = [
  "Accordion",
  "Badge",
  "BottomNavigation",
  "Breadcrumbs",
  "Button",
  "ButtonGroup",
  "Checkbox",
  "Chip",
  "Dialog",
  "Drawer",
  "Link",
  "List",
  "Menu",
  "ProgressBar",
  "RadioButtons",
  "Select",
  "Slider",
  "Snackbar",
  "Stepper",
  "Switch",
  "Table",
  "Tabs",
  "TextArea",
  "TextField",
];

const optionsHTML5 = [
  "Button",
  "Checkbox",
  "Checklist",
  "ColorPicker",
  "Combobox",
  "DateTimeSelector",
  "Dropdown",
  "FileInput",
  "Link",
  "MultiSelector",
  "NumberSelector",
  "ProgressBar",
  "RadioButtons",
  "Range",
  "Table",
  "Text",
  "TextArea",
  "TextField",
  "Title",
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
    expect(getTypesMenuOptions(elementLibrary.MUI)).toStrictEqual(optionsMUI);
  });

  test("get types", () => {
    expect(getTypesMenuOptions(elementLibrary.HTML5)).toStrictEqual(optionsHTML5);
  });
});
