// keys
export enum LocalStorageKey {
  IsOnboardingPassed = "JDN_IS_ONBOARDING_PASSED",
  AnnotationType = "JDN_ANNOTATION_TYPE",
  LocatorType = "JDN_LOCATOR_TYPE",
  Library = "JDN_LIBRARY",
  Filter = "JDN_FILTER",
}

export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};
