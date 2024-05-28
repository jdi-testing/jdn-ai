import { RootState } from '../../../app/store/store';
import { MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { selectCurrentPageObject, selectCurrentPOLocatorType } from '../../pageObjects/selectors/pageObjects.selectors';
import { ILocator, LocatorsGenerationStatus } from '../types/locator.types';
import { locatorGenerationController } from './LocatorGenerationController';
import { GeneralLocatorType, LocatorType } from '../../../common/types/common';
import { URL } from '../../../app/utils/constants';
import { selectServerLocation } from '../../../app/main.selectors';

export const runLocatorGeneration = (
  state: RootState,
  generationData: ILocator[],
  pageDocument: string,
  maxGenerationTime?: MaxGenerationTime,
) => {
  const pageObject = selectCurrentPageObject(state)!;
  const locatorType: GeneralLocatorType = selectCurrentPOLocatorType(state) ?? LocatorType.xPath;

  // TODO: remove when back-end will be ready (issues/1734) 20-21 lines
  const serverLocation = selectServerLocation(state);
  const isLocalServer = serverLocation === URL.local;

  locatorGenerationController.scheduleMultipleLocatorGeneration(
    locatorType,
    generationData,
    pageDocument,
    pageObject,
    maxGenerationTime,
    // TODO: remove when back-end will be ready (issues/1734) 30 line
    isLocalServer,
  );

  return LocatorsGenerationStatus.started;
};
