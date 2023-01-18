import { JSDOM } from "jsdom";
import { findBySelectors } from "../../../pageServices/contentScripts/findBySelectors";
import { getLibrarySelectors } from "../createSelector";
import { VueRules } from "../Vue.rules";
import { card } from "./mocks/card.mock";
import { iconButton } from "./mocks/iconButton.mock";
import { manySimpleElements } from "./mocks/manySimpleElements.mock.js";
import { vueRulesMock } from "./mocks/vueRules.mock";

const runQuery = (domSource, callback) => {
  const dom = new JSDOM(domSource);
  global.document = dom.window.document;

  const selectors = getLibrarySelectors(vueRulesMock());
  findBySelectors();
  chrome.runtime.sendMessage({ message: "FIND_BY_SELECTORS", param: selectors }, callback);
};

test("finds simple Vuetify elements by rules", () => {
  const checkResult = (data) => {
    expect(data.length).toBe(3);
    expect(data[0].predicted_label).toBe("button");
    expect(data[1].predicted_label).toBe("icon");
    expect(data[2].predicted_label).toBe("button");
  };
  runQuery(manySimpleElements, checkResult);
});

test("don't recognize content if detectContent: undefined", () => {
  const checkResult = (data) => {
    expect(data.length).toBe(1);
    expect(data[0].predicted_label).toBe("button");
  };
  runQuery(iconButton, checkResult);
});

test("solve priority conflicts", () => {
  const checkResult = (data) => {
    expect(data[0].predicted_label).toBe("card");
  };
  runQuery(card, checkResult);
});

test("recognize content if detectContent: true", () => {
  const checkResult = (data) => {
    expect(data.length).toBe(3);
    expect(data[0].predicted_label).toBe("card");
    expect(data[1].predicted_label).toBe("button");
    expect(data[2].predicted_label).toBe("button");
  };
  runQuery(card, checkResult);
});
