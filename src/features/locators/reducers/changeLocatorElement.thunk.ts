import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { LocatorTaskStatus, LocatorsState } from "../types/locator.types";
import { locatorsAdapter, selectLocatorById } from "../locators.selectors";
import { RootState } from "../../../app/store/store";
import { ChangeLocatorAttributesPayload } from "../locators.slice";
import { evaluateXpath } from "../utils/utils";
import { generateId, getElementFullXpath, parseElementFromString } from "../../../common/utils/helpers";
import { sendMessage } from "../../../pageServices/connector";

type ChangeLocatorElementPayload = ChangeLocatorAttributesPayload;

export const changeLocatorElement = createAsyncThunk(
  "locators/changeLocatorElement",
  async (payload: ChangeLocatorElementPayload, thunkAPI) => {
    const { locator, element_id, ...rest } = payload;

    let { foundHash } = JSON.parse(await evaluateXpath(locator, element_id));
    const { foundElement } = JSON.parse(await evaluateXpath(locator, element_id));

    const state = thunkAPI.getState() as RootState;

    const _locator = selectLocatorById(state, element_id);

    if (!_locator) return;

    if (!foundHash) {
      foundHash = generateId();
      await sendMessage
        .assignJdnHash({ jdnHash: foundHash, xpath: locator })
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

    const newValue = {
      ..._locator,
      ...rest,
      elemText: parsedElement?.textContent || "",
      jdnHash: foundHash,
      isCustomLocator: true,
      locator: {
        fullXpath: fullXpath,
        customXpath: locator,
        robulaXpath: "", // we need to calc robulaXpath
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
