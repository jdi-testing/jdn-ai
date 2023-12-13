import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorTaskStatus, LocatorsState } from '../types/locator.types';
import { locatorsAdapter, selectLocatorById } from '../selectors/locators.selectors';
import { RootState } from '../../../app/store/store';
import { ChangeLocatorAttributesPayload } from '../locators.slice';
import { generateSelectorByHash, evaluateLocator } from '../utils/utils';
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

    const state = thunkAPI.getState() as RootState;
    const currentLocator = selectLocatorById(state, element_id);

    if (!currentLocator) return;

    const isDataAttributeLocator = locatorType === LocatorType.dataAttributes || locatorType.startsWith('data-');
    const isCSSLocator = locatorType === LocatorType.cssSelector;
    const isXPathLocator = locatorType === LocatorType.xPath;
    const isStandardLocator =
      [
        LocatorType.cssSelector,
        LocatorType.className,
        LocatorType.id,
        LocatorType.linkText,
        LocatorType.name,
        LocatorType.tagName,
        LocatorType.dataAttributes,
      ].includes(locatorType) || locatorType.startsWith('data-');

    let foundHash, foundElementText, cssSelector, fullXpath;

    ({ foundHash, foundElementText } = JSON.parse(await await evaluateLocator(locator, locatorType, element_id)));

    if (!foundHash) {
      foundHash = generateId();
      await sendMessage
        .assignJdnHash({ jdnHash: foundHash, locator, isCSSLocator })
        .then((res) => {
          if (res !== 'success') throw new Error('Failed to assign jdnHash');
        })
        .catch((err) => console.log(err));
    }

    const newValue: ILocator = {
      ...currentLocator,
      locator: { ...currentLocator.locator, output: locator },
      locatorType,
      ...rest,
      elemText: foundElementText || '',
      jdnHash: foundHash,
    };

    if (isCSSLocator) {
      fullXpath = await getElementFullXpath(foundHash);
      newValue.locator.cssSelector = locator;
      newValue.locator.xPath = fullXpath;
      newValue.locator.cssSelectorStatus = LocatorTaskStatus.SUCCESS;
    } else if (isXPathLocator) {
      cssSelector = (await generateSelectorByHash(element_id, foundHash)).cssSelector;
      newValue.locator.cssSelector = cssSelector;
      newValue.locator.xPath = locator;
      newValue.locator.xPathStatus = LocatorTaskStatus.SUCCESS;
    } else if (isStandardLocator) {
      if (isDataAttributeLocator) {
        newValue.locator.attributes = {
          ...newValue.locator.attributes,
          dataAttributes: { ...(newValue.locator.attributes?.dataAttributes || {}) },
        }; // unfreeze object

        if (newValue.locator.attributes.dataAttributes) {
          newValue.locator.attributes.dataAttributes[locatorType] = locator;
        }
      } else {
        const attributes = { ...newValue.locator.attributes }; // unfreeze object
        attributes[locatorType] = locator;
        newValue.locator.attributes = attributes;
      }
    }
    return newValue;
  },
);

export const changeLocatorElementReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  builder
    .addCase(changeLocatorElement.fulfilled, (state, { payload }) => {
      // @ts-ignore
      locatorsAdapter.upsertOne(state, payload);
    })
    .addCase(changeLocatorElement.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
