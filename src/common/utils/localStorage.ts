// keys
export const isOnboardingPassed = "jdnIsOnboardingPassed";

export const setLocalStorage = (key: string, value: any) => {
  const _value = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, JSON.stringify(_value));
};

export const getLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};
