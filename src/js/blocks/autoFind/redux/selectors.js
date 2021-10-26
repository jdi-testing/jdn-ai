import { createSelector } from "@reduxjs/toolkit";

export const selectLocatorsByProbability = createSelector(
    (state) => state.main.locators,
    (state) => state.main.perception,
    (items, perception) => items.filter((e) => e.predicted_probability >= perception)
);
