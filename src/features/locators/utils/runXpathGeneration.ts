import { RootState } from '../../../app/store/store';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { ILocator, LocatorsGenerationStatus } from '../types/locator.types';
import { locatorGenerationController } from './LocatorGenerationController';

export const runXpathGeneration = async (
  state: RootState,
  generationData: ILocator[],
  maxGenerationTime?: MaxGenerationTime,
) => {
  const pageObject = selectCurrentPageObject(state)!;
  await locatorGenerationController.scheduleMultipleXpathGeneration(generationData, pageObject, maxGenerationTime);

  return LocatorsGenerationStatus.started;
};
