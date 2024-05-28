import { type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorsState, ValidationStatus } from '../types/locator.types';
import { generateId, getElementFullXpath, getElementOriginalCssSelector } from '../../../common/utils/helpers';
import { addLocatorToPageObj } from '../../pageObjects/pageObject.slice';
import { addLocators, setActiveSingle, setScrollToLocator } from '../locators.slice';
import { evaluateLocator, evaluateXpath, getLocatorValidationStatus } from '../utils/utils';
import { sendMessage } from '../../../pageServices/connector';
import { locatorsAdapter } from '../selectors/locators.selectors';
import { LocatorType } from '../../../common/types/common';

export const addCustomLocator = createAsyncThunk(
  'locators/addCustomLocator',
  async (payload: { newLocatorData: ILocator & { locatorFormValue: string } }, thunkAPI) => {
    const { newLocatorData } = payload;
    const { message, locatorValue, locatorType, pageObj: pageObjectId, locatorFormValue } = newLocatorData;

    const isXPathLocator = locatorType === LocatorType.xPath;
    const isStandardLocator: boolean =
      [
        LocatorType.cssSelector,
        LocatorType.className,
        LocatorType.id,
        LocatorType.linkText,
        LocatorType.name,
        LocatorType.tagName,
      ].includes(locatorType) || locatorType.startsWith('data-');

    let foundHash;
    let foundElementText;
    let originalCssSelector = '';
    let fullXpath = '';
    // ToDo: fix legacy naming
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const elementId = `${generateId()}_${pageObjectId}`;

    if (getLocatorValidationStatus(message) === ValidationStatus.SUCCESS) {
      try {
        if ((isXPathLocator && locatorValue.xPath) || (isStandardLocator && locatorFormValue)) {
          const locatorData = await (isXPathLocator && locatorValue.xPath
            ? evaluateXpath(locatorValue.xPath, elementId)
            : evaluateLocator(locatorFormValue, locatorType, elementId));

          ({ foundHash, foundElementText } = JSON.parse(locatorData));
        }

        if (!foundHash) {
          foundHash = elementId.split('_')[0];
          await sendMessage
            .assignJdnHash({
              jdnHash: foundHash,
              ...{ locatorValue: isStandardLocator ? locatorFormValue : locatorValue.xPath ?? '' },
              isCSSLocator: isStandardLocator,
            })
            .then((res) => {
              if (res === 'success') return res;
              else throw new Error('Failed to assign jdnHash');
            })
            .catch((err) => {
              console.warn(err);
            });
        }

        if (isXPathLocator) {
          originalCssSelector = await getElementOriginalCssSelector(foundHash);
        }

        if (isStandardLocator) {
          fullXpath = await getElementFullXpath(foundHash);
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const newLocator: ILocator = {
      ...newLocatorData,
      elementId,
      locatorValue: {
        ...newLocatorData.locatorValue,
        ...(isStandardLocator ? { xPath: fullXpath } : { cssSelector: originalCssSelector }),
      },
      elemText: foundElementText || '',
      jdnHash: foundHash,
    };

    const dispatch = thunkAPI.dispatch;
    dispatch(addLocators([newLocator]));
    dispatch(addLocatorToPageObj({ pageObjId: pageObjectId, locatorId: newLocator.elementId }));
    dispatch(setActiveSingle(newLocator));
    dispatch(setScrollToLocator(newLocator.elementId));

    return newLocator;
  },
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
