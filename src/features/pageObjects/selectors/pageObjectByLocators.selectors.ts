import { createSelector } from "@reduxjs/toolkit";
import { size } from "lodash";
import { RootState } from "../../../app/store/store";
import { selectConfirmedLocators } from "../../locators/selectors/locatorsFiltered.selectors";
import { selectPageObjects } from "./pageObjects.selectors";
import { PageObjectId } from "../types/pageObjectSlice.types";

export const selectEmptyPageObjects = createSelector(
  selectPageObjects,
  (state: RootState) => state,
  (pageObjects, state) => {
    const emptyPOs: PageObjectId[] = [];
    if (pageObjects) {
      pageObjects.forEach((po) => {
        const loc = selectConfirmedLocators(state, po.id);
        if (!size(loc)) emptyPOs.push(po.id);
      });
    }
    return emptyPOs;
  }
);
