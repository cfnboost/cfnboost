import { Readable, Writable } from 'stream';
import { DirectoryEntry } from '../core/FileCrawler.js';

export class TestFsFileEntry {
  public contents: Buffer;

  constructor(contents?: string | Buffer) {
    this.contents = Buffer.from(contents ?? '');
  }

  public createReadStream(encoding?: BufferEncoding): Readable {
    return Readable.from([
      encoding ? this.contents.toString(encoding) : this.contents,
    ]);
  }

  public createWriteStream(encoding?: BufferEncoding): Writable {
    const chunks: Buffer[] = [];

    return new Writable({
      defaultEncoding: encoding,

      write: (chunk, enc, callback) => {
        chunks.push(Buffer.from(chunk, enc));
        callback();
      },

      final: (callback) => {
        this.contents = Buffer.concat(chunks);
        callback();
      },
    });
  }

  public readFile(): Promise<Buffer>;
  public readFile(encoding: BufferEncoding): Promise<string>;
  public async readFile(encoding?: BufferEncoding): Promise<Buffer | string> {
    if (encoding) {
      return this.contents.toString(encoding);
    }
    return this.contents;
  }

  public async stat(): Promise<DirectoryEntry> {
    return {
      isDirectory: () => false,
      isFile: () => true,
    };
  }
}
