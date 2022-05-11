import { Readable } from 'stream';

/**
 * Represents a file inside a zip archive.
 */
export interface ZipArchiveFileEntry {
  content: Readable;
  path: string;
  date: Date;
}

/**
 * Represents a class which can build a zip archive.
 */
export interface ZipArchive {
  append(entry: ZipArchiveFileEntry): void;
  build(): Promise<Readable>;
}
