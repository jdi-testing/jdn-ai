export const accumulateAndDenounce = (fn: (arg: any[]) => any) => {
  let accumulatedArgs: any[] = [];
  let interval: NodeJS.Timer | null = null;
  let cancelTimeout: NodeJS.Timeout | null = null;

  const debouncedFn = (args: any[]) => {
    accumulatedArgs.push(...args);
  };

  const throttledFn = () => {
    if (accumulatedArgs.length > 0) {
      cancelTimeout && clearTimeout(cancelTimeout);
      fn(accumulatedArgs);
      accumulatedArgs = [];
    } else {
      if (cancelTimeout) return;
      cancelTimeout = setTimeout(() => interval && clearInterval(interval), 30000);
    }
  };

  interval = setInterval(throttledFn, 500);

  return (args: any) => {
    debouncedFn(args);
  };
};
