import { createSelector } from "../../services/rules/createSelector";
import {
  ruleMock1,
  ruleMock2,
  ruleMock3,
  ruleMock4,
  ruleMock5,
  ruleMock6,
  ruleMock7,
  ruleMock8,
  ruleMock9,
} from "./__mocks__/ruleMocks";

test("create correct selector", () => {
  expect(createSelector(ruleMock1)).toBe("button.v-btn");
  expect(createSelector(ruleMock2)).toBe(".v-btn.primary");
  expect(createSelector(ruleMock3)).toBe("i");
  expect(createSelector(ruleMock4)).toBe(".v-picker--date:has(.v-date-picker-table--date)");
  expect(createSelector(ruleMock5)).toBe(".v-picker.v-light:has(.v-picker--date.v-input)");
  expect(createSelector(ruleMock6, ruleMock2)).toBe(".v-select:not([class*='v-btn']):not([class*='primary'])");
  expect(createSelector(ruleMock6, ruleMock3)).toBe(".v-select:not(i)");
  expect(createSelector(ruleMock6, ruleMock7)).toBe(".v-select:not(:has(colgroup))");
  expect(createSelector(ruleMock6, ruleMock8)).toBe(".v-select:not(:has([class*='v-light']))");
  expect(createSelector(ruleMock9)).toBe("[class*=text-]");
});
