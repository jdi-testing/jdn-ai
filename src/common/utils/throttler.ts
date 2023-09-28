import { Middleware } from '@reduxjs/toolkit';
import { selectAreInProgress } from '../../features/locators/selectors/locatorsByPO.selectors';

class Throttler {
  accumulatedArgs: any[] = [];

  interval: NodeJS.Timer | null = null;

  constructor() {
    this.accumulateAndThrottle = this.accumulateAndThrottle.bind(this);
  }

  accumulateAndThrottle(fn: (arg: any[]) => any) {
    const debouncedFn = (args: any[]) => {
      this.accumulatedArgs.push(...args);
    };

    const throttledFn = () => {
      if (this.accumulatedArgs.length === 0) return;

      try {
        fn(this.accumulatedArgs);
      } catch (error) {
        this.quitThrottler();
        if (__DEV_ENVIRONMENT__) console.log("Can't invoke throttled function:", error);
      }
      this.accumulatedArgs = [];
    };

    if (!this.interval) this.interval = setInterval(throttledFn, 500);

    return (args: any) => {
      debouncedFn(args);
    };
  }

  quitThrottler() {
    this.interval && clearInterval(this.interval);
    this.interval = null;
  }
}

export const throttler = new Throttler();

export const quitThrottlerMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case 'locators/updateLocatorGroup':
    case 'locators/failGeneration':
      if (!selectAreInProgress(store.getState())) {
        throttler.quitThrottler();
      }
      break;
  }

  return result;
};
