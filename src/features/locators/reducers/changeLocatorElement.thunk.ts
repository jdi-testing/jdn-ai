import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { LocatorTaskStatus, LocatorsState } from "../types/locator.types";
import { locatorsAdapter, selectLocatorById } from "../locators.selectors";
import { RootState } from "../../../app/store/store";
import { ChangeLocatorAttributesPayload } from "../locators.slice";
import { evaluateXpath, evaluateCssSelector } from "../utils/utils";
import { generateId, getElementFullXpath } from "../../../common/utils/helpers";
import { sendMessage } from "../../../pageServices/connector";
import { LocatorType } from "../../../common/types/common";

type ChangeLocatorElementPayload = ChangeLocatorAttributesPayload;

export const changeLocatorElement = createAsyncThunk(
  "locators/changeLocatorElement",
  async (payload: ChangeLocatorElementPayload, thunkAPI) => {
    const { locator, element_id, locatorType, ...rest } = payload;
    const isCSSLocator = locatorType === LocatorType.cssSelector;
    let foundHash;
    let foundElementText;
    if (!isCSSLocator) {
      ({ foundHash, foundElementText } = JSON.parse(await evaluateXpath(locator, element_id)));
    } else {
      ({ foundHash, foundElementText } = JSON.parse(await evaluateCssSelector(locator, element_id)));
    }

    const state = thunkAPI.getState() as RootState;

    const _locator = selectLocatorById(state, element_id);

    if (!_locator) return;

    if (!foundHash) {
      foundHash = generateId();
      await sendMessage
        .assignJdnHash({ jdnHash: foundHash, locator, isCSSLocator })
        .then((res) => {
          if (res === "success") return res;
          else throw new Error("Failed to assign jdnHash");
        })
        .catch((err) => {
          console.log(err);
        });
    }

    const fullXpath = await getElementFullXpath(foundHash);

    const newValue = {
      ..._locator,
      ...rest,
      locatorType,
      elemText: foundElementText || "",
      jdnHash: foundHash,
      isCustomLocator: true,
      locator: {
        // we need to calc robulaXpath
        fullXpath: fullXpath,
        ...(isCSSLocator ? { cssSelector: locator, customXpath: null } : { customXpath: locator }),
        taskStatus: LocatorTaskStatus.SUCCESS,
      },
    };

    return newValue;
  }
);

export const changeLocatorElementReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(changeLocatorElement.fulfilled, (state, { payload }) => {
      // @ts-ignore
      locatorsAdapter.upsertOne(state, payload);
    })
    .addCase(changeLocatorElement.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
