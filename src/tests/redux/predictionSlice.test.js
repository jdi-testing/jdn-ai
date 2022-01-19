import { addLocators, changeLocatorAttributes } from "../../store/predictionSlice";
import { selectLocatorById } from "../../store/selectors";
import { store } from "../../store/store";
import { locator1 } from "./locator.mock";

describe("changeLocatorAttributes reducer", () => {
  beforeAll(() => {
    store.dispatch(addLocators([locator1]));
  });

  test("edit type, name changed automatically", () => {
    debugger;
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
  });
});
