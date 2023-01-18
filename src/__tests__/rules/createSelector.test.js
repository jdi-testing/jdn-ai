import { createSelector } from "../../features/rules/createSelector";
import { ruleMock1, ruleMock2, ruleMock3, ruleMock4, ruleMock5 } from "./__mocks__/ruleMocks";

test("create correct selector", () => {
  expect(createSelector(ruleMock1)).toBe("button.v-btn");
  expect(createSelector(ruleMock2)).toBe(".v-btn.primary");
  expect(createSelector(ruleMock3)).toBe("i");
  expect(createSelector(ruleMock4)).toBe(".v-picker--date:has(.v-date-picker-table--date)");
  expect(createSelector(ruleMock5)).toBe(".v-picker:has(.v-picker--date.v-input)");
});
