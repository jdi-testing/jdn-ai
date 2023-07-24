import { Middleware } from "@reduxjs/toolkit";
import { areInProgress } from "../../features/locators/selectors/locatorsFiltered.selectors";

class Debouncer {
  accumulatedArgs: any[] = [];
  interval: NodeJS.Timer | null = null;

  constructor() {
    this.accumulateAndDebounce = this.accumulateAndDebounce.bind(this);
  }

  accumulateAndDebounce(fn: (arg: any[]) => any) {
    const debouncedFn = (args: any[]) => {
      this.accumulatedArgs.push(...args);
    };

    const throttledFn = () => {
      if (this.accumulatedArgs.length === 0) return;

      try {
        fn(this.accumulatedArgs);
      } catch (error) {
        this.quitDebouncer();
        if (__DEV_ENVIRONMENT__) console.log("Can't invoke throttled function:", error);
      }
      this.accumulatedArgs = [];
    };

    if (!this.interval) this.interval = setInterval(throttledFn, 500);

    return (args: any) => {
      debouncedFn(args);
    };
  }

  quitDebouncer() {
    this.interval && clearInterval(this.interval);
    this.interval = null;
  }
}

export const debouncer = new Debouncer();

export const quitDebouncerMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case "locators/updateLocatorGroup":
    case "locators/failGeneration":
      if (!areInProgress(store.getState())) {
        debouncer.quitDebouncer();
      }
      break;
  }

  return result;
};
