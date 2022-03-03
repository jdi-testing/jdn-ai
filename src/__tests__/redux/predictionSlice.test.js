import { sendMessage } from "../../services/connector";
import { addLocators, changeLocatorAttributes } from "../../store/slices/locatorsSlice";
import { selectLocatorById } from "../../store/selectors/locatorSelectors";
import { store } from "../../store/store";
import { locator1 } from "../__mocks__/locator.mock";

/* global jest*/

describe("changeLocatorAttributes reducer", () => {
  let changeElementNameSpy;
  let removeElementSpy;
  let replaceElementSpy;

  beforeAll(() => {
    store.dispatch(addLocators([locator1]));

    changeElementNameSpy = jest.spyOn(sendMessage, "changeElementName");
    removeElementSpy = jest.spyOn(sendMessage, "removeElement");
    replaceElementSpy = jest.spyOn(sendMessage, "replaceElement");
  });

  test("edit type, name changed automatically", () => {
    store.dispatch(
        changeLocatorAttributes({
          element_id: "8736312404689610766421832473",
          locator: "//*[@class='sidebar-menu left']",
          name: "radiobuttonsUl",
          type: "checkbox",
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
          type: "progress",
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
          type: "dialog",
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
          type: "dialog",
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator.type).toBe("Dialog");
    expect(locator.name).toBe("myAwesomeLocator");
    expect(locator.locator.customXpath).toBe("//*[@class='any-class']");
    expect(changeElementNameSpy).toHaveBeenCalledWith(locator);
  });

  test("warned validation", () => {
    const oldLocator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    store.dispatch(
        changeLocatorAttributes({
          element_id: "8736312404689610766421832473",
          locator: "//*[@class='any-class112']",
          validity: {
            locator: "NOT_FOUND"
          }
        })
    );
    const locator = selectLocatorById(store.getState(), "8736312404689610766421832473");
    expect(locator).toBeDefined();
    expect(locator.validity.locator).toBe("NOT_FOUND");

    expect(removeElementSpy).toHaveBeenCalled();
    expect(removeElementSpy).toHaveBeenCalledWith(oldLocator);
  });

  test("replaces element with new coords and locator", () => {
    const newId = "00000000000001";
    const element_id = "8736312404689610766421832473";
    const newXpath = "/html/body/div[1]/div[1]";

    const oldElement = selectLocatorById(store.getState(), element_id);

    store.dispatch(
        changeLocatorAttributes({
          newElement: {
            element_id: newId,
            x: 111,
            y: 111,
            width: 222,
            height: 222
          },
          element_id,
          locator: newXpath,
          validity: {
            locator: "NEW_ELEMENT"
          }
        })
    );
    const locator = selectLocatorById(store.getState(), newId);
    expect(locator).toBeDefined();
    expect(locator.locator.customXpath).toBe(newXpath);
    expect(locator.predicted_probability).toBe(1);
    expect(locator.validity).toStrictEqual({locator: "NEW_ELEMENT"});

    expect(replaceElementSpy).toHaveBeenCalled();
    expect(replaceElementSpy).toHaveBeenCalledWith({oldElement, newElement: {...locator}});
  });
});
