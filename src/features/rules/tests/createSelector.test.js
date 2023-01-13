import { createSelector } from "../createSelector";

const ruleMock1 = {
  tag: "button",
  classes: ["v-btn"],
};

const ruleMock2 = {
  classes: ["v-btn", "primary"],
};

const ruleMock3 = {
  tag: "i",
  classes: [],
};

test("create correct selector", () => {
  expect(createSelector(ruleMock1)).toBe("button.v-btn");
  expect(createSelector(ruleMock2)).toBe(".v-btn.primary");
  expect(createSelector(ruleMock3)).toBe("i");
});
