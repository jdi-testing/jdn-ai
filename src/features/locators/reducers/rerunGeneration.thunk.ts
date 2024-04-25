import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { ILocator, LocatorsState, LocatorTaskStatus } from '../types/locator.types';
import { sendMessage } from '../../../pageServices/connector';
import { runLocatorsGeneration } from './runLocatorsGeneration.thunk';
import { getTaskStatus } from '../utils/utils';

interface Meta {
  generationData: ILocator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const rerunGeneration = createAsyncThunk('locators/rerunGeneration', async (meta: Meta, thunkAPI) => {
  const {
    jdnHash,
    locatorValue: { xPath, xPathStatus, cssSelectorStatus },
  } = meta.generationData[0];

  const taskStatus = getTaskStatus(xPathStatus, cssSelectorStatus);

  if (meta.generationData.length === 1 && taskStatus === LocatorTaskStatus.FAILURE) {
    await sendMessage.assignJdnHash({ jdnHash, locatorValue: xPath ?? '' });
  }
  return thunkAPI.dispatch(
    runLocatorsGeneration({ locators: meta.generationData, maxGenerationTime: meta.maxGenerationTime }),
  );
});

export const rerunGenerationReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder.addCase(rerunGeneration.rejected, (_, { error }) => {
    throw new Error(error.stack);
  });
};
