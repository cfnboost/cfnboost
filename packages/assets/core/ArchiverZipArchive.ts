import archiver, { Archiver, ArchiverOptions } from 'archiver';
import { Readable } from 'stream';
import { ZipArchive, ZipArchiveFileEntry } from './ZipArchive.js';

/**
 * Implements {@link ZipArchive} using the `archiver` package.
 */
export class ArchiverZipArchive implements ZipArchive {
  private readonly zip: Archiver;
  private lastError: any;

  constructor(opts: ArchiverOptions = { zlib: { level: 9 } }) {
    this.zip = archiver('zip', opts);
    this.zip.on('error', (err) => {
      this.lastError = err;
    });
  }

  public append(entry: ZipArchiveFileEntry): void {
    this.zip.append(entry.content, {
      name: entry.path,
      date: entry.date,
    });
  }

  public async build(): Promise<Readable> {
    if (this.lastError !== undefined) {
      throw this.lastError;
    }
    // awaiting this doesn't seem to be necessary and appears to cause a hang in
    // certain situations
    void this.zip.finalize();
    return this.zip;
  }
}
