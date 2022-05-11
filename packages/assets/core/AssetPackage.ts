import { Readable } from 'stream';
import { Provider } from '../internal/Provider.js';

/**
 * Represents an asset package.
 */
export interface AssetPackage {
  addFile(name: string, content: Provider<Readable>): void;
  build(): PromiseLike<Readable>;
}
