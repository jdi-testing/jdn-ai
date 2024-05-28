import { sendMessage } from '../../pageServices/connector';
import { addLocators, changeLocatorAttributes } from '../../features/locators/locators.slice';
import { selectLocatorById } from '../../features/locators/selectors/locators.selectors';
import { store } from '../../app/store/store';
import { locator1 } from '../__mocks__/locator.mock';
import { LocatorTaskStatus } from '../../features/locators/types/locator.types';
import { ElementLibrary } from '../../features/locators/types/generationClasses.types';
import { changePage } from '../../app/main.slice';
import { PageType } from '../../app/types/mainSlice.types';
import { LocatorType } from '../../common/types/common';

/* global jest*/

describe('changeLocatorAttributes reducer', () => {
  let changeElementNameSpy;
  let removeElementSpy;

  beforeAll(() => {
    store.dispatch(addLocators([locator1]));
    store.dispatch(changePage({ page: PageType.LocatorsList }));

    changeElementNameSpy = jest.spyOn(sendMessage, 'changeElementName');
    removeElementSpy = jest.spyOn(sendMessage, 'removeElement');
  });

  test('should update type and name when editing a locator', () => {
    // Arrange
    const locatorMock = {
      ...locator1,
      type: 'ProgressBar',
      name: 'myAwesomeLocator',
      locatorValue: "//*[@class='sidebar-menu left']",
      message: '',
      library: ElementLibrary.MUI,
      locatorType: LocatorType.xPath,
    };

    // Act
    store.dispatch(changeLocatorAttributes(locatorMock));

    // Assert
    const locator = selectLocatorById(store.getState(), '8736312404689610766421832473');
    expect(locator.type).toBe('ProgressBar');
    expect(locator.name).toBe('myAwesomeLocator');
    expect(locator.locatorValue).toStrictEqual({
      attributes: {},
      cssSelector: '.sidebar-menu.left',
      output: "//*[@class='sidebar-menu left']",
      taskStatus: LocatorTaskStatus.SUCCESS,
      xPath: "//*[@class='sidebar-menu left']",
      xPathStatus: LocatorTaskStatus.SUCCESS,
    });
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test('should not update type and name when they remain the same', () => {
    // Act
    store.dispatch(
      changeLocatorAttributes({
        elementId: '8736312404689610766421832473',
        is_shown: true,
        locatorValue: "//*[@class='sidebar-menu left']",
        name: 'myAwesomeLocator',
        type: 'ProgressBar',
        message: '',
        library: ElementLibrary.MUI,
        locatorType: LocatorType.xPath,
      }),
    );

    // Assert
    const locator = selectLocatorById(store.getState(), '8736312404689610766421832473');
    expect(locator.type).toBe('ProgressBar');
    expect(locator.name).toBe('myAwesomeLocator');
    expect(locator.locatorValue).toStrictEqual({
      attributes: {},
      cssSelector: '.sidebar-menu.left',
      output: "//*[@class='sidebar-menu left']",
      taskStatus: LocatorTaskStatus.SUCCESS,
      xPath: "//*[@class='sidebar-menu left']",
      xPathStatus: LocatorTaskStatus.SUCCESS,
    });
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test('should update type and keep custom name when editing a locator', () => {
    // Act
    store.dispatch(
      changeLocatorAttributes({
        elementId: '8736312404689610766421832473',
        is_shown: true,
        locatorValue: "//*[@class='sidebar-menu left']",
        name: 'myAwesomeLocator',
        message: '',
        type: 'Dialog',
        library: ElementLibrary.MUI,
        locatorType: LocatorType.xPath,
      }),
    );

    // Assert
    const locator = selectLocatorById(store.getState(), '8736312404689610766421832473');
    expect(locator.type).toBe('Dialog');
    expect(locator.name).toBe('myAwesomeLocator');
    expect(locator.locatorValue).toStrictEqual({
      attributes: {},
      cssSelector: '.sidebar-menu.left',
      output: "//*[@class='sidebar-menu left']",
      taskStatus: LocatorTaskStatus.SUCCESS,
      xPath: "//*[@class='sidebar-menu left']",
      xPathStatus: LocatorTaskStatus.SUCCESS,
    });
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test('should update locator when editing a locator', () => {
    // Act
    store.dispatch(
      changeLocatorAttributes({
        elementId: '8736312404689610766421832473',
        is_shown: true,
        locatorValue: "//*[@class='any-class']",
        locatorType: LocatorType.xPath,
        name: 'myAwesomeLocator',
        isCustomName: true,
        type: 'Dialog',
        message: '',
        library: ElementLibrary.MUI,
      }),
    );

    // Assert
    const locator = selectLocatorById(store.getState(), '8736312404689610766421832473');
    expect(locator.type).toBe('Dialog');
    expect(locator.name).toBe('myAwesomeLocator');
    expect(locator.isCustomLocator).toBeTruthy();
    expect(locator.isCustomName).toBeTruthy();
    expect(locator.locatorValue.xPath).toBe("//*[@class='any-class']");
    expect(locator.locatorValue.xPathStatus).toBe(LocatorTaskStatus.SUCCESS);
  });

  test('should handle warned validation and remove element', () => {
    // Arrange
    const oldLocator = selectLocatorById(store.getState(), '8736312404689610766421832473');

    // Act
    store.dispatch(
      changeLocatorAttributes({
        elementId: '8736312404689610766421832473',
        is_shown: true,
        locatorValue: "//*[@class='any-class112']",
        name: 'myAwesomeLocator',
        type: 'Dialog',
        message: 'NOT_FOUND',
        library: ElementLibrary.MUI,
        locatorType: LocatorType.cssSelector,
      }),
    );

    // Assert
    const locator = selectLocatorById(store.getState(), '8736312404689610766421832473');
    expect(locator).toBeDefined();
    expect(locator.message).toBe('NOT_FOUND');

    expect(removeElementSpy).toHaveBeenCalled();
    expect(removeElementSpy).toHaveBeenCalledWith(oldLocator);
  });
});
