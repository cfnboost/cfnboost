import { Readable, Writable } from 'stream';

/**
 * Represents a file or directory.
 */
export interface DirectoryEntry {
  isDirectory(): boolean;
  isFile(): boolean;
}

/**
 * Represents a file or directory.
 */
export interface DirectoryEntryWithName extends DirectoryEntry {
  name: string;
}

export type FsCreateReadStream = (path: string) => Readable;
export type FsCreateWriteStream = (path: string) => Writable;
export type FsReadDir = (path: string) => PromiseLike<DirectoryEntryWithName[]>;

export type FsReadFile = (
  path: string,
  encoding: BufferEncoding,
) => Promise<string>;

export type FsResolve = (...paths: string[]) => string;
export type FsStat = (path: string) => PromiseLike<DirectoryEntry>;

/**
 * Represents an object for exploring a file system.
 */
export interface FileCrawler {
  createReadStream: FsCreateReadStream;
  createWriteStream: FsCreateWriteStream;
  readdir: FsReadDir;
  readFile: FsReadFile;
  resolve: FsResolve;
  stat: FsStat;
}
