import { addLocatorsToPageObj, addLocatorToPageObj } from "../../../store/pageObjectSlice";
import { selectPageObjById, selectPageObjects } from "../../../store/selectors/pageObjectSelectors";
import { store } from "../../../store/store";
import { addPageObj } from "../../../store/thunks/addPageObject";
import * as pageObject from "../../../services/pageObject";
import { clearAll } from "../../../store/mainSlice";

describe("pageObject reducers", () => {
  beforeAll(async () => {
    store.dispatch(clearAll());

    jest
        .spyOn(pageObject, "getPageAttributes")
        .mockImplementation(() => (
          [{result: { title: "HomePage", url: "https://jdi-testing.github.io/jdi-light/contacts.html" }}]
        ));

    store.dispatch(addPageObj());
    store.dispatch(addPageObj());
    store.dispatch(addPageObj());
  });

  test("add locator to page object", () => {
    const pageObjId = 1;
    const locatorId = "8736312404689610766421832473";
    store.dispatch(addLocatorToPageObj({ pageObjId, locatorId }));

    const pageObj = selectPageObjById(store.getState(), pageObjId);
    expect(pageObj.locators).toContain(locatorId);
  });

  test("add many locators to page object", () => {
    const pageObjId = 2;
    const locatorIds = ["8736312404689610766421832473", "2222222222", "333333333333333"];
    store.dispatch(addLocatorsToPageObj(locatorIds));

    const pageObj = selectPageObjById(store.getState(), pageObjId);
    expect(pageObj.locators).toHaveLength(3);
    expect(pageObj.locators).toContain(locatorIds[0]);
    expect(pageObj.locators).toContain(locatorIds[1]);
    expect(pageObj.locators).toContain(locatorIds[2]);
  });

  test("select list of pageObjects", () => {
    const pageObjList = selectPageObjects(store.getState());
    expect(pageObjList).toHaveLength(3);
  });
});
