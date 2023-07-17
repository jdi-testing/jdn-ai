class Debouncer {
  accumulatedArgs: any[] = [];
  interval: NodeJS.Timer | null = null;
  cancelTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.accumulateAndDebounce = this.accumulateAndDebounce.bind(this);
  }

  accumulateAndDebounce(fn: (arg: any[]) => any) {

    const debouncedFn = (args: any[]) => {
      this.accumulatedArgs.push(...args);
    };

    const throttledFn = () => {
      if (this.accumulatedArgs.length > 0) {
        this.cancelTimeout && clearTimeout(this.cancelTimeout);
        fn(this.accumulatedArgs);
        this.accumulatedArgs = [];
      } else {
        if (this.cancelTimeout) return;
        this.cancelTimeout = setTimeout(() => {
          this.interval && clearInterval(this.interval);
          this.interval = null;
        }, 30000);
      }
    };

    if (!this.interval) this.interval = setInterval(throttledFn, 500);

    return (args: any) => {
      debouncedFn(args);
    };
  };
}

export const debouncer = new Debouncer();
