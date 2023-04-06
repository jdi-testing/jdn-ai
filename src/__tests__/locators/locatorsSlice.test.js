import { sendMessage } from "../../pageServices/connector";
import { addLocators, changeLocatorAttributes } from "../../features/locators/locators.slice";
import { selectLocatorById } from "../../features/locators/locators.selectors";
import { store } from "../../app/store/store";
import { locator1 } from "../__mocks__/locator.mock";
import { locatorTaskStatus } from "../../common/constants/constants";
import { ElementLibrary } from "../../features/locators/types/generationClasses.types";
import { changePage } from "../../app/main.slice";
import { PageType } from "../../app/types/mainSlice.types";

/* global jest*/

describe("changeLocatorAttributes reducer", () => {
  let changeElementNameSpy;
  let removeElementSpy;

  beforeAll(() => {
    store.dispatch(addLocators([locator1]));
    store.dispatch(changePage({ page: PageType.LocatorsList }));

    changeElementNameSpy = jest.spyOn(sendMessage, "changeElementName");
    removeElementSpy = jest.spyOn(sendMessage, "removeElement");
  });

  test("edit type and name", () => {
    store.dispatch(
      changeLocatorAttributes({
        element_id: "8736312404689610766421832473",
        locator: "//*[@class='sidebar-menu left']",
        name: "myAwesomeLocator",
        type: "ProgressBar",
        library: ElementLibrary.MUI,
      })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("ProgressBar");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.locator).toStrictEqual(locator1.locator);
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("din't edit type and name", () => {
    store.dispatch(
      changeLocatorAttributes({
        element_id: "8736312404689610766421832473",
        locator: "//*[@class='sidebar-menu left']",
        name: "myAwesomeLocator",
        type: "ProgressBar",
        library: ElementLibrary.MUI,
      })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("ProgressBar");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.locator).toStrictEqual(locator1.locator);
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("edit type, custom name stays the same", () => {
    store.dispatch(
      changeLocatorAttributes({
        element_id: "8736312404689610766421832473",
        locator: "//*[@class='sidebar-menu left']",
        name: "myAwesomeLocator",
        type: "Dialog",
        library: ElementLibrary.MUI,
      })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("Dialog");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.locator).toStrictEqual(locator1.locator);
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("edit locator", () => {
    store.dispatch(
      changeLocatorAttributes({
        element_id: "8736312404689610766421832473",
        locator: "//*[@class='any-class']",
        name: "myAwesomeLocator",
        isCustomName: true,
        type: "Dialog",
        library: ElementLibrary.MUI,
      })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("Dialog");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.isCustomLocator).toBeTruthy();
    expect(locator.isCustomName).toBeTruthy();
    expect(locator.locator.customXpath).toBe("//*[@class='any-class']");
    expect(locator.locator.taskStatus).toBe(locatorTaskStatus.SUCCESS);
  });

  test("warned validation", () => {
    const oldLocator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    store.dispatch(
      changeLocatorAttributes({
        element_id: "8736312404689610766421832473",
        locator: "//*[@class='any-class112']",
        name: "myAwesomeLocator",
        type: "Dialog",
        message: "NOT_FOUND",
        library: ElementLibrary.MUI,
      })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator).toBeDefined();
    expect(locator.message).toBe("NOT_FOUND");

    expect(removeElementSpy).toHaveBeenCalled();
    expect(removeElementSpy).toHaveBeenCalledWith(oldLocator);
  });
});
