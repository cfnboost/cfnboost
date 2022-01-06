import { Readable } from 'stream';
import { AssetDescriptor } from './AssetDescriptor.js';

export interface AssetBuilder extends AssetDescriptor {
  build(): PromiseLike<Readable>;
}
