import { copyToClipboard } from '../../../common/utils/copyToClipboard';

export const copyLocatorsToClipboard = (valueArr: string[], isCustomDivider?: boolean) => {
  const transformedText = valueArr.join(`${isCustomDivider ? '\n' : '\n\n'}`);
  copyToClipboard(transformedText);
};
