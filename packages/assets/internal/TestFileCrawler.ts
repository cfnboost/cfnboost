import { dirname, posix } from 'path';
import { Readable, Writable } from 'stream';
import {
  DirectoryEntry,
  DirectoryEntryWithName,
  FileCrawler,
} from '../core/FileCrawler.js';
import { TestFileCrawlerDir } from './TestFileCrawlerDir.js';
import { TestFsDirEntry } from './TestFsDirEntry.js';

export class TestFileCrawler implements FileCrawler {
  private readonly root: TestFsDirEntry;

  constructor(
    private readonly cwd: string,
    root: TestFileCrawlerDir,
    rootPath = '/',
  ) {
    if (!posix.isAbsolute(cwd)) {
      throw new Error(`${cwd}: the cwd needs to be absolute`);
    }
    if (!posix.isAbsolute(rootPath)) {
      throw new Error(`${rootPath}: the root needs to be absolute`);
    }
    if (rootPath === '/') {
      this.root = new TestFsDirEntry(root);
    } else {
      this.root = new TestFsDirEntry();
      this.root.setNode(rootPath, root);
    }
  }

  public createReadStream = jest.fn((path: string): Readable => {
    return this.root.readnode(this.resolve(path), true).createReadStream();
  });

  public createWriteStream = jest.fn((path: string): Writable => {
    return this.root.createWriteStream(dirname(this.resolve(path)));
  });

  public readdir = jest.fn(
    (path: string): Promise<DirectoryEntryWithName[]> => {
      return this.root.readnode(this.resolve(path), false).readdir();
    },
  );

  public readFile = jest.fn(
    (path: string, encoding: BufferEncoding): Promise<string> => {
      return this.root.readnode(this.resolve(path), true).readFile(encoding);
    },
  );

  public resolve = jest.fn((...paths: string[]): string => {
    return posix.resolve(this.cwd, ...paths);
  });

  public stat = jest.fn((path: string): Promise<DirectoryEntry> => {
    return this.root.readnode(this.resolve(path)).stat();
  });
}
