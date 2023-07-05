export class CustomError<T = any> extends Error {
  options: T | undefined;

  constructor(message: string, options?: T) {
    super(message);
    this.options = options;
  }
}
