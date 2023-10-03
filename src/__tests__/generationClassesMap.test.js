import { ElementLibrary } from '../features/locators/types/generationClasses.types';
import { getJdiClassName, getJDILabel, getTypesMenuOptions } from '../features/locators/utils/locatorTypesUtils';

const optionsMUI = [
  'Accordion',
  'Badge',
  'BottomNavigation',
  'Breadcrumbs',
  'Button',
  'ButtonGroup',
  'Checkbox',
  'Chip',
  'Dialog',
  'Drawer',
  'Link',
  'List',
  'Menu',
  'ProgressBar',
  'RadioButtons',
  'Select',
  'Slider',
  'Snackbar',
  'Stepper',
  'Switch',
  'Table',
  'Tabs',
  'TextArea',
  'TextField',
];

const optionsHTML5 = [
  'Button',
  'Checkbox',
  'Checklist',
  'ColorPicker',
  'Combobox',
  'DateTimeSelector',
  'Dropdown',
  'FileInput',
  'Label',
  'Link',
  'MultiSelector',
  'NumberSelector',
  'ProgressBar',
  'RadioButtons',
  'Range',
  'Table',
  'Text',
  'TextArea',
  'TextField',
  'Title',
];

describe('Get JDI class by predicted label', () => {
  test("get 'Badge' for 'badge", () => {
    const res = getJDILabel('badge', ElementLibrary.MUI);
    expect(res).toBe('Badge');
  });

  test("get 'UIElement' for 'anyUnsupportedClass", () => {
    const res = getJDILabel('anyUnsupportedClass', ElementLibrary.MUI);
    expect(res).toBe('UIElement');
  });

  test("get 'Breadcrumbs' for 'breadcrumbs'", () => {
    expect(getJdiClassName('breadcrumbs', ElementLibrary.MUI)).toBe('Breadcrumbs');
  });

  test("get 'UIElement (anyType)' for 'anyType'", () => {
    expect(getJdiClassName('anyType', ElementLibrary.MUI)).toBe('UIElement (anyType)');
  });

  test("get 'UIElement (undefined)' for 'undefined'", () => {
    expect(getJdiClassName(undefined, ElementLibrary.MUI)).toBe('UIElement (undefined)');
  });

  test('get types', () => {
    expect(getTypesMenuOptions(ElementLibrary.MUI)).toStrictEqual(optionsMUI);
  });

  test('get types', () => {
    expect(getTypesMenuOptions(ElementLibrary.HTML5)).toStrictEqual(optionsHTML5);
  });
});
