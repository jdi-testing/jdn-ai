export const mergeObjects = (obj1: Record<string, any>, obj2: Record<string, any>): void => {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
};
