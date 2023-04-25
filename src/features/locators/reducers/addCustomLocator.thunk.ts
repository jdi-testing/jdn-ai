import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorsState, ValidationStatus } from "../types/locator.types";
import { getElementFullXpath, parseElementFromString, generateId } from "../../../common/utils/helpers";
import { addLocatorToPageObj } from "../../pageObjects/pageObject.slice";
import { addLocators, setScrollToLocator } from "../locators.slice";
import { getLocatorValidationStatus, evaluateXpath } from "../utils/utils";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { sendMessage } from "../../../pageServices/connector";
import { locatorsAdapter } from "../locators.selectors";

export const addCustomLocator = createAsyncThunk(
  "locators/addCustomLocator",
  async (payload: { newLocator: Locator; pageObjectId: PageObjectId }, thunkAPI) => {
    let { newLocator } = payload;
    const { pageObjectId } = payload;

    let { element_id } = newLocator;
    const { message, locator } = newLocator;

    element_id = element_id || `${generateId()}_${pageObjectId}`;

    if (getLocatorValidationStatus(message) === ValidationStatus.SUCCESS) {
      try {
        let { foundHash } = JSON.parse(await evaluateXpath(locator.customXpath!, element_id));
        const { foundElement } = JSON.parse(await evaluateXpath(locator.customXpath!, element_id));
        if (!foundHash) {
          foundHash = element_id.split("_")[0];
          await sendMessage
            .assignJdnHash({ jdnHash: foundHash, xPath: locator.customXpath! })
            .then((res) => {
              if (res === "success") return res;
              else throw new Error("Failed to assign jdnHash");
            })
            .catch((err) => {
              console.log(err);
            });
        }
        const fullXpath = await getElementFullXpath(foundElement);
        const parsedElement = parseElementFromString(foundElement);
        newLocator = {
          ...newLocator,
          element_id,
          elemText: parsedElement?.textContent || "",
          locator: { ...newLocator.locator, fullXpath },
          jdnHash: foundHash,
        };
      } catch (err) {
        console.log(err);
      }
    }

    const dispatch = thunkAPI.dispatch;

    dispatch(addLocators([newLocator]));
    dispatch(addLocatorToPageObj({ pageObjId: pageObjectId, locatorId: newLocator.element_id }));
    dispatch(setScrollToLocator(newLocator.element_id));

    return newLocator;
  }
);

export const addCustomLocatorReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(addCustomLocator.fulfilled, (state, { payload }) => {
      // @ts-ignore
      locatorsAdapter.addOne(state, payload);
    })
    .addCase(addCustomLocator.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
