import { type Middleware } from '@reduxjs/toolkit';
import { selectAreInProgress } from '../../features/locators/selectors/locatorsByPO.selectors';
import { CssSelectorsGenerationPayload, XpathMultipleGenerationPayload } from '../../services/webSocketMessageHandler';

class Throttler {
  accumulatedArgs: (CssSelectorsGenerationPayload | XpathMultipleGenerationPayload)[] = [];

  interval: NodeJS.Timeout | null = null;

  constructor() {
    this.accumulateAndThrottle = this.accumulateAndThrottle.bind(this);
  }

  accumulateAndThrottle(fn: (arg: CssSelectorsGenerationPayload | XpathMultipleGenerationPayload) => any) {
    const debouncedFn = (args: CssSelectorsGenerationPayload | XpathMultipleGenerationPayload) => {
      this.accumulatedArgs.push(args);
    };

    const throttledFn = () => {
      if (this.accumulatedArgs.length === 0) return;

      try {
        this.accumulatedArgs.forEach((arg) => fn(arg));
        this.accumulatedArgs = [];
      } catch (error) {
        this.quitThrottler();
        if (__DEV_ENVIRONMENT__) console.warn("Can't invoke throttled function:", error);
      }
    };

    if (!this.interval) this.interval = setInterval(throttledFn, 500);

    return (args: CssSelectorsGenerationPayload | XpathMultipleGenerationPayload) => {
      debouncedFn(args);
    };
  }

  quitThrottler() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.accumulatedArgs = [];
    }
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
