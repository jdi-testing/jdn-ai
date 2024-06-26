import { sendMessage } from '../../../pageServices/connector';
import { setParents } from '../../../pageServices/pageDataHandlers';
import { createLocatorNames } from '../../pageObjects/utils/pageObject';
import { ElementLibrary } from '../types/generationClasses.types';
import { ILocator, PredictedEntity } from '../types/locator.types';
import { convertToListWithChildren } from './locatorsTreeUtils';

export const createLocatorAttributes = async (
  elements: PredictedEntity[],
  library: ElementLibrary,
  isAutogenerated: Record<'generateCssSelector' | 'generateXpath', boolean>,
) => {
  const generationTags = await sendMessage.generateAttributes({
    elements,
    generateCss: isAutogenerated.generateCssSelector,
  });

  const generationData = createLocatorNames(generationTags, library);
  const locatorsWithParents = await setParents(generationData);
  const locatorsWithChildren: ILocator[] = convertToListWithChildren(locatorsWithParents);

  return locatorsWithChildren;
};
