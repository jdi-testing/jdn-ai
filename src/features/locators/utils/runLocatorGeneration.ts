import { RootState } from '../../../app/store/store';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { selectCurrentPageObject, selectCurrentPOLocatorType } from '../../pageObjects/selectors/pageObjects.selectors';
import { ILocator, LocatorsGenerationStatus } from '../types/locator.types';
import { locatorGenerationController } from './LocatorGenerationController';
import { GeneralLocatorType, LocatorType } from '../../../common/types/common';

export const runLocatorGeneration = (
  state: RootState,
  generationData: ILocator[],
  pageDocument: string,
  maxGenerationTime?: MaxGenerationTime,
) => {
  const pageObject = selectCurrentPageObject(state)!;
  const locatorType: GeneralLocatorType = selectCurrentPOLocatorType(state) ?? LocatorType.xPath;

  locatorGenerationController.scheduleMultipleLocatorGeneration(
    locatorType,
    generationData,
    pageDocument,
    pageObject,
    maxGenerationTime,
  );

  return LocatorsGenerationStatus.started;
};
