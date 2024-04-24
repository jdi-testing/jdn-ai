export const escapeLocatorString = (selector: string): string => {
  return selector.replace(/(["'\\])/g, '\\$1');
};
