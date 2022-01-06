import { Readable } from 'stream';
import { AssetBuilder } from './AssetBuilder.js';
import { AssetDescriptor } from './AssetDescriptor.js';

/**
 * Represents an asset package in for deployment.
 */
export class Asset implements AssetBuilder {
  public get BucketParam(): string {
    return this.descriptor.BucketParam;
  }

  public get FileName(): string {
    return this.descriptor.FileName;
  }

  public get KeyParam(): string {
    return this.descriptor.KeyParam;
  }

  public get Name(): string {
    return this.descriptor.Name;
  }

  constructor(
    private readonly descriptor: AssetDescriptor,
    public readonly build: () => PromiseLike<Readable>,
  ) {}
}
