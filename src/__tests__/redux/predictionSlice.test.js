import { sendMessage } from "../../services/connector";
import { addLocators, changeLocatorAttributes } from "../../store/slices/locatorsSlice";
import { selectLocatorById } from "../../store/selectors/locatorSelectors";
import { store } from "../../store/store";
import { locator1 } from "../__mocks__/locator.mock";
import { elementLibrary } from "../../utils/generationClassesMap";
import { locatorTaskStatus } from "../../utils/constants";

/* global jest*/

describe("changeLocatorAttributes reducer", () => {
  let changeElementNameSpy;
  let removeElementSpy;

  beforeAll(() => {
    store.dispatch(addLocators([locator1]));

    changeElementNameSpy = jest.spyOn(sendMessage, "changeElementName");
    removeElementSpy = jest.spyOn(sendMessage, "removeElement");
  });

  test("edit type, name changed automatically", () => {
    store.dispatch(
        changeLocatorAttributes({
          element_id: "8736312404689610766421832473",
          locator: "//*[@class='sidebar-menu left']",
          name: "radiobuttonsUl",
          type: "Checkbox",
          library: elementLibrary.MUI,
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("Checkbox");
    expect(locator.name).toBe("checkbox");
    expect(locator.locator).toStrictEqual(locator1.locator);
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("edit type and name", () => {
    store.dispatch(
        changeLocatorAttributes({
          element_id: "8736312404689610766421832473",
          locator: "//*[@class='sidebar-menu left']",
          name: "myAwesomeLocator",
          type: "ProgressBar",
          library: elementLibrary.MUI,
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
          library: elementLibrary.MUI,
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
          library: elementLibrary.MUI,
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("Dialog");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.locator).toStrictEqual(locator1.locator);
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("edit locator", () => {
    console.log(selectLocatorById(store.getState(), "8736312404689610766421832473"));
    store.dispatch(
        changeLocatorAttributes({
          element_id: "8736312404689610766421832473",
          locator: "//*[@class='any-class']",
          name: "myAwesomeLocator",
          type: "Dialog",
          library: elementLibrary.MUI,
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    console.log(locator);
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
          validity: {
            locator: "NOT_FOUND"
          },
          library: elementLibrary.MUI,
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator).toBeDefined();
    expect(locator.validity.locator).toBe("NOT_FOUND");

    expect(removeElementSpy).toHaveBeenCalled();
    expect(removeElementSpy).toHaveBeenCalledWith(oldLocator);
  });
});
