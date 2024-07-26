import { type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { locatorsAdapter, selectLocatorById } from '../selectors/locators.selectors';
import { RootState } from '../../../app/store/store';
import { ChangeLocatorAttributesPayload } from '../locators.slice';
import { evaluateLocator } from '../utils/utils';
import { generateId, getElementFullXpath, getElementOriginalCssSelector } from '../../../common/utils/helpers';
import { sendMessage } from '../../../pageServices/connector';
import { LocatorType } from '../../../common/types/common';

type ChangeLocatorElementPayload = ChangeLocatorAttributesPayload;

export const changeLocatorElement = createAsyncThunk(
  'locators/changeLocatorElement',
  async (payload: ChangeLocatorElementPayload, thunkAPI) => {
    const { locatorValue, elementId, locatorType, ...rest } = payload;

    const state = thunkAPI.getState() as RootState;
    const currentLocator = selectLocatorById(state, elementId);

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

    let foundHash, foundElementText, originalCssSelector, fullXpath;

    try {
      ({ foundHash, foundElementText } = JSON.parse(await evaluateLocator(locatorValue, locatorType, elementId)));
    } catch (error) {
      console.error('change locator element error: ', error);
    }

    if (!foundHash) {
      foundHash = generateId();
      await sendMessage
        .assignJdnHash({ jdnHash: foundHash, locatorValue, isCSSLocator })
        .then((res) => {
          if (res !== 'success') throw new Error('Failed to assign jdnHash');
        })
        .catch((err) => console.log(err));
    }

    const newValue: ILocator = {
      ...currentLocator,
      locatorValue: { ...currentLocator.locatorValue, output: locatorValue },
      locatorType,
      ...rest,
      elemText: foundElementText || '',
      jdnHash: foundHash,
    };

    if (isCSSLocator) {
      fullXpath = await getElementFullXpath(foundHash);
      newValue.locatorValue.cssSelector = locatorValue;
      newValue.locatorValue.xPath = fullXpath;
      newValue.locatorValue.cssSelectorStatus = LocatorTaskStatus.SUCCESS;
    } else if (isXPathLocator) {
      originalCssSelector = await getElementOriginalCssSelector(foundHash);
      newValue.locatorValue.originalCssSelector = originalCssSelector;
      newValue.locatorValue.xPath = locatorValue;
      newValue.locatorValue.xPathStatus = LocatorTaskStatus.SUCCESS;
    } else if (isStandardLocator) {
      if (isDataAttributeLocator) {
        newValue.locatorValue.attributes = {
          ...newValue.locatorValue.attributes,
          dataAttributes: { ...(newValue.locatorValue.attributes?.dataAttributes || {}) },
        }; // unfreeze object

        if (newValue.locatorValue.attributes.dataAttributes) {
          newValue.locatorValue.attributes.dataAttributes[locatorType] = locatorValue;
        }
      } else {
        const attributes = { ...newValue.locatorValue.attributes }; // unfreeze object
        attributes[locatorType] = locatorValue;
        newValue.locatorValue.attributes = attributes;
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
