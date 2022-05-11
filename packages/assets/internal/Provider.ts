/**
 * A function which can provide a value, either asynchronously or synchronously.
 */
export type Provider<T> = () => T | PromiseLike<T>;
