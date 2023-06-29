import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { Locator, LocatorsState, ValidationStatus } from "../types/locator.types";
import { generateId, getElementFullXpath } from "../../../common/utils/helpers";
import { addLocatorToPageObj } from "../../pageObjects/pageObject.slice";
import { addLocators, setScrollToLocator } from "../locators.slice";
import { getLocatorValidationStatus, evaluateXpath, evaluateCssSelector, generateSelectorByHash } from "../utils/utils";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { sendMessage } from "../../../pageServices/connector";
import { locatorsAdapter } from "../selectors/locators.selectors";
import { LocatorType } from "../../../common/types/common";

export const addCustomLocator = createAsyncThunk(
  "locators/addCustomLocator",
  async (payload: { newLocator: Locator; pageObjectId: PageObjectId }, thunkAPI) => {
    let { newLocator } = payload;
    const { pageObjectId } = payload;
    const { message, locator, locatorType } = newLocator;

    const isCSSLocator = locatorType === LocatorType.cssSelector;

    let foundHash;
    let foundElementText;
    let cssSelector = "";
    let fullXpath = "";

    const element_id = `${generateId()}_${pageObjectId}`;

    newLocator = {
      ...newLocator,
      element_id,
    };

    if (getLocatorValidationStatus(message) === ValidationStatus.SUCCESS) {
      try {
        if (isCSSLocator) {
          ({ foundHash, foundElementText } = JSON.parse(await evaluateCssSelector(locator.cssSelector, element_id)));
        } else {
          ({ foundHash, foundElementText } = JSON.parse(await evaluateXpath(locator.xPath, element_id)));
        }

        if (!foundHash) {
          foundHash = element_id.split("_")[0];
          await sendMessage
            .assignJdnHash({
              jdnHash: foundHash,
              ...{ locator: isCSSLocator ? locator.cssSelector : locator.xPath },
              isCSSLocator,
            })
            .then((res) => {
              if (res === "success") return res;
              else throw new Error("Failed to assign jdnHash");
            })
            .catch((err) => {
              console.log(err);
            });
        }

        isCSSLocator
          ? (fullXpath = await getElementFullXpath(foundHash))
          : ({ cssSelector } = await generateSelectorByHash(element_id, foundHash));

        newLocator = {
          ...newLocator,
          locator: {
            ...newLocator.locator,
            ...(isCSSLocator ? { xPath: fullXpath } : { cssSelector }),
          },
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
