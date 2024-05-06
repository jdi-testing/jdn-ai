export const escapeLocatorString = (selector: string): string => {
  return selector.replace(/(["'\\])/g, '\\$1');
};

export const fullEscapeLocatorString = (str: string = ''): string => {
  return str
    .replaceAll(/\\/g, '\\\\') // escape backslash
    .replaceAll(/\"/g, '\\"') // escape double quotes
    .replaceAll(/\'/g, "\\'") // escape single quotes
    .replaceAll(/\b/g, '\\b') // escape backspaces
    .replaceAll(/\t/g, '\\t') // escape tabs
    .replaceAll(/\n/g, '\\n') // escape newlines
    .replaceAll(/\r/g, '\\r') // escape carriage returns
    .replaceAll(/\f/g, '\\f'); // escape form feeds
};

export const checkForEscaped = (str: string = ''): boolean => {
  const found = str.match(/\\/);
  return found ? true : false;
};
