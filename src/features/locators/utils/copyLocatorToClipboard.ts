import { copyToClipboard } from '../../../common/utils/copyToClipboard';

export const escapeLocator = (locator: string) => {
  let transformedText = locator.replace(/[\\'\n]/g, (match: string) => {
    switch (match) {
      case '\\':
        return '\\\\\\\\';
      case "'":
        return "\\'";
      case '\n':
        return '\\n';
      default:
        return match;
    }
  });
  const lastDoubleQuote = transformedText.lastIndexOf('"');
  const firstDoubleQuote = transformedText.indexOf('"');
  const beforeFirstDoubleQuote = transformedText.slice(0, firstDoubleQuote + 1);
  const afterLastDoubleQuote = transformedText.slice(lastDoubleQuote);
  let insideOfDoubleQuotes = transformedText.slice(firstDoubleQuote + 1, lastDoubleQuote);

  if (insideOfDoubleQuotes.includes('"')) {
    insideOfDoubleQuotes = insideOfDoubleQuotes.replace(/"/g, '\\\\"');
    transformedText = beforeFirstDoubleQuote + insideOfDoubleQuotes + afterLastDoubleQuote;
  }

  return transformedText;
};

export const copyLocatorToClipboard = (value: string) => {
  const transformedText = escapeLocator(value);
  copyToClipboard(transformedText);
};

export const copyLocatorsToClipboard = (valueArr: string[]) => {
  const transformedText = valueArr.map((el: string) => escapeLocator(el)).join('\\n\\n');
  copyToClipboard(transformedText);
};
