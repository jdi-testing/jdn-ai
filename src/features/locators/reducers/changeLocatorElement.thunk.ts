import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { LocatorTaskStatus, LocatorsState } from '../types/locator.types';
import { locatorsAdapter, selectLocatorById } from '../selectors/locators.selectors';
import { RootState } from '../../../app/store/store';
import { ChangeLocatorAttributesPayload } from '../locators.slice';
import { evaluateXpath, generateSelectorByHash, evaluateStandardLocator } from '../utils/utils';
import { generateId, getElementFullXpath } from '../../../common/utils/helpers';
import { sendMessage } from '../../../pageServices/connector';
import { LocatorType } from '../../../common/types/common';

type ChangeLocatorElementPayload = ChangeLocatorAttributesPayload;

export const changeLocatorElement = createAsyncThunk(
  'locators/changeLocatorElement',
  async (payload: ChangeLocatorElementPayload, thunkAPI) => {
    // ToDo: fix legacy naming
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { locator, element_id, locatorType, ...rest } = payload;
    const isCSSLocator = locatorType === LocatorType.cssSelector;
    let foundHash;
    let foundElementText;
    let cssSelector;
    let fullXpath;

    const isStandardLocator: boolean =
      locatorType === LocatorType.cssSelector ||
      locatorType === LocatorType.className ||
      locatorType === LocatorType.id ||
      locatorType === LocatorType.linkText ||
      locatorType === LocatorType.name ||
      locatorType === LocatorType.tagName ||
      locatorType.startsWith('data-');

    if (isStandardLocator) {
      ({ foundHash, foundElementText } = JSON.parse(await evaluateStandardLocator(locator, locatorType, element_id)));
    } else {
      ({ foundHash, foundElementText } = JSON.parse(await evaluateXpath(locator, element_id)));
    }

    const state = thunkAPI.getState() as RootState;
    // ToDo: fix legacy naming
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _locator = selectLocatorById(state, element_id);

    if (!_locator) return;

    if (!foundHash) {
      foundHash = generateId();
      await sendMessage
        .assignJdnHash({ jdnHash: foundHash, locator, isCSSLocator })
        .then((res) => {
          if (res === 'success') return res;
          else throw new Error('Failed to assign jdnHash');
        })
        .catch((err) => {
          console.log(err);
        });
    }

    isCSSLocator
      ? (fullXpath = await getElementFullXpath(foundHash))
      : ({ cssSelector } = await generateSelectorByHash(element_id, foundHash));

    const newValue = {
      ..._locator,
      ...rest,
      locatorType,
      elemText: foundElementText || '',
      jdnHash: foundHash,
      locator: {
        ...(isCSSLocator ? { cssSelector: locator, xPath: fullXpath } : { xPath: locator, cssSelector }),
        ...(isCSSLocator
          ? { cssSelectorStatus: LocatorTaskStatus.SUCCESS }
          : { xPathStatus: LocatorTaskStatus.SUCCESS }),
      },
    };

    return newValue;
  },
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
