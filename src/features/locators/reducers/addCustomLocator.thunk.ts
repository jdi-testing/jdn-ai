import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorsState, ValidationStatus } from "../types/locator.types";
import { generateId } from "../../../common/utils/helpers";
import { addLocatorToPageObj } from "../../pageObjects/pageObject.slice";
import { addLocators, setScrollToLocator } from "../locators.slice";
import { getLocatorValidationStatus, evaluateXpath, generateSelectorByHash } from "../utils/utils";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { sendMessage } from "../../../pageServices/connector";
import { locatorsAdapter } from "../locators.selectors";

export const addCustomLocator = createAsyncThunk(
  "locators/addCustomLocator",
  async (payload: { newLocator: Locator; pageObjectId: PageObjectId }, thunkAPI) => {
    let { newLocator } = payload;
    const { pageObjectId } = payload;
    const { message, locator } = newLocator;

    const element_id = `${generateId()}_${pageObjectId}`;

    newLocator = {
      ...newLocator,
      element_id,
    };

    if (getLocatorValidationStatus(message) === ValidationStatus.SUCCESS) {
      try {
        const result = JSON.parse(await evaluateXpath(locator.xPath, element_id));
        const { foundElementText } = result;
        let { foundHash } = result;

        if (!foundHash) {
          foundHash = element_id.split("_")[0];
          await sendMessage
            .assignJdnHash({ jdnHash: foundHash, locator: locator.xPath, isCSSLocator: false })
            .then((res) => {
              if (res === "success") return res;
              else throw new Error("Failed to assign jdnHash");
            })
            .catch((err) => {
              console.log(err);
            });
        }

        const { cssSelector } = await generateSelectorByHash(element_id, foundHash);

        newLocator = {
          ...newLocator,
          locator: { ...newLocator.locator, cssSelector },
          elemText: foundElementText || "",
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
