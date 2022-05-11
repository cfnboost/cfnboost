import { Readable } from 'stream';
import { Provider } from '../internal/Provider.js';
import { ArchiverZipArchive } from './ArchiverZipArchive.js';
import { AssetPackage } from './AssetPackage.js';
import { ZipArchive } from './ZipArchive.js';

export class ZipAssetPackage implements AssetPackage {
  private readonly archive: ZipArchive;
  private readonly entries: [string, Provider<Readable>][] = [];

  constructor(dep?: { archive?: ZipArchive }) {
    this.archive = dep?.archive ?? new ArchiverZipArchive();
  }

  public addFile(name: string, content: Provider<Readable>): void {
    this.entries.push([name, content]);
  }

  public async build(): Promise<Readable> {
    this.entries.sort(([a], [b]) => a.localeCompare(b));

    for (const [path, content] of this.entries) {
      this.archive.append({
        path,
        content: await content(),
        date: new Date(0),
      });
    }

    return await this.archive.build();
  }
}
