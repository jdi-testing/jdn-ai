export const getEnumKeyByValue = (enumObject: Record<string, string>, value: string) => {
  return Object.entries(enumObject).find(([_, val]) => val === value)?.[0];
};
