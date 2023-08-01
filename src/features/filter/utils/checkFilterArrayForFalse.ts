export const checkFilterArrayForFalse = (array: [string, boolean][]): boolean =>
  array.some((item) => item[1] === false);
