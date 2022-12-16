import { createSelector } from "../createSelector";

const ruleMock = {
  tag: "button",
  classes: ["v-btn"],
};

test("create correct selector", () => {
  expect(createSelector(ruleMock)).toBe("button.v-btn");
});
