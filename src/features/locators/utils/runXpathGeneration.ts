import { RootState } from '../../../app/store/store';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { ILocator, LocatorsGenerationStatus } from '../types/locator.types';
import { locatorGenerationController } from './LocatorGenerationController';

export const runXpathGeneration = (
  state: RootState,
  generationData: ILocator[],
  pageDocument: string,
  maxGenerationTime?: MaxGenerationTime,
) => {
  const pageObject = selectCurrentPageObject(state)!;

  locatorGenerationController.scheduleMultipleXpathGeneration(
    generationData,
    pageDocument,
    pageObject,
    maxGenerationTime,
  );

  return LocatorsGenerationStatus.started;
};
