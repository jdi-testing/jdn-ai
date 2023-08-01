type InputObject = Record<string, boolean>;

export const hasFalseValue = (obj: InputObject): boolean => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === false) {
      return true;
    }
  }
  return false;
};
