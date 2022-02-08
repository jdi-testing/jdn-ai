import { addLocatorsToPageObj, addLocatorToPageObj, addPageObj } from "../../../store/pageObjectSlice";
import { clearAll } from "../../../store/predictionSlice";
import { selectPageObjById, selectPageObjects } from "../../../store/selectors/pageObjectSelectors";
import { store } from "../../../store/store";
import pageObjects from "./pageObjects.mock.json";

describe("pageObject reducers", () => {
  beforeAll(() => {
    store.dispatch(clearAll());

    store.dispatch(addPageObj(pageObjects[0]));
    store.dispatch(addPageObj(pageObjects[1]));
    store.dispatch(addPageObj(pageObjects[2]));
  });

  test("add locator to page object", () => {
    const pageObjId = "1111";
    const locatorId = "8736312404689610766421832473";
    store.dispatch(addLocatorToPageObj({pageObjId, locatorId}));

    const pageObj = selectPageObjById(store.getState(), pageObjId);
    expect(pageObj.locators).toContain(locatorId);
  });

  test("add many locators to page object", () => {
    const pageObjId = "2222";
    const locatorIds = ["8736312404689610766421832473", "2222222222", "333333333333333"];
    store.dispatch(addLocatorsToPageObj({pageObjId, locatorIds}));

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
