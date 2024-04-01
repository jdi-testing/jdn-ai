export const escapeString = (str: string = '') => {
  return str
    .replace(/\\/g, '\\\\') // escape backslash
    .replace(/"/g, '\\"') // escape double quotes
    .replace(/\n/g, '\\n') // escape newlines
    .replace(/\r/g, '\\r') // escape carriage returns
    .replace(/\t/g, '\\t'); // escape tabs
};

export const unescapeString = (str: string = '') => {
  return str
    .replace(/\\n/g, '\n') // unescape newlines
    .replace(/\\r/g, '\r') // unescape carriage returns
    .replace(/\\t/g, '\t') // unescape tabs
    .replace(/\\"/g, '"') // unescape double quotes
    .replace(/\\\\/g, '\\'); // unescape backslashes
};
