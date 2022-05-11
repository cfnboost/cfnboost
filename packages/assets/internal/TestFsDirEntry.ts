import { Writable } from 'stream';
import { DirectoryEntry, DirectoryEntryWithName } from '../core/FileCrawler.js';
import { FSError } from './FSError.js';
import { TestFileCrawlerDir } from './TestFileCrawlerDir.js';
import { TestFsFileEntry } from './TestFsFileEntry.js';

type FsEntry = TestFsDirEntry | TestFsFileEntry;

export class TestFsDirEntry {
  private readonly entries = new Map<string, FsEntry>();

  constructor(init?: TestFileCrawlerDir) {
    if (init) {
      for (const [path, entry] of Object.entries(init)) {
        this.setNode(path, entry);
      }
    }
  }

  public createWriteStream(path: string, encoding?: BufferEncoding): Writable {
    try {
      return this.readnode(path, true).createWriteStream(encoding);
    } catch (err) {
      if (err instanceof FSError && err.code === 'ENOENT') {
        const file = new TestFsFileEntry();
        this.setNode(path, file);
        return file.createWriteStream(encoding);
      }
      throw err;
    }
  }

  public async mkdir(
    path: string,
    { recursive = false }: { recursive?: boolean } = {},
  ): Promise<TestFsDirEntry> {
    const parts = path.split('/').filter(Boolean);
    const current = parts.shift();
    if (!current) {
      throw new FSError('ENOENT', 'no such file or directory');
    }

    let entry = this.entries.get(parts[0]);
    if (entry && (!recursive || entry instanceof TestFsFileEntry)) {
      throw new FSError('EEXIST', 'file already exists');
    }

    if (!entry) {
      if (parts.length && !recursive) {
        throw new FSError('ENOENT', 'no such file or directory');
      }
      entry = new TestFsDirEntry();
      this.entries.set(current, entry);
    }

    if (parts.length) {
      return entry.mkdir(parts.join('/'), { recursive });
    }

    return entry;
  }

  public async readdir(path?: string): Promise<DirectoryEntryWithName[]> {
    const node = this.readnode(path ?? '/', false);
    return [...node.entries.entries()].map(([name, node]) => ({
      name,
      isDirectory: () => node instanceof TestFsDirEntry,
      isFile: () => node instanceof TestFsFileEntry,
    }));
  }

  public readnode(path: string, isFile: true): TestFsFileEntry;
  public readnode(path: string, isFile: false): TestFsDirEntry;
  public readnode(
    path: string,
    isFile?: boolean,
  ): TestFsDirEntry | TestFsFileEntry;
  public readnode(
    path: string,
    isFile?: boolean,
  ): TestFsDirEntry | TestFsFileEntry {
    const parts = path.split('/').filter(Boolean);
    const parent = parts.shift();

    if (!parent) {
      if (isFile === true) {
        throw new FSError('EISDIR', 'illegal operation on a directory');
      }
      return this;
    }

    const node = this.entries.get(parent);
    if (!node) {
      throw new FSError('ENOENT', 'no such file or directory');
    }
    if (!parts.length) {
      if (isFile === true) {
        if (node instanceof TestFsDirEntry) {
          throw new FSError('EISDIR', 'illegal operation on a directory');
        }
      } else if (isFile === false) {
        if (node instanceof TestFsFileEntry) {
          throw new FSError('ENOTDIR', 'not a directory');
        }
      }
      return node;
    }
    if (node instanceof TestFsFileEntry) {
      throw new FSError('ENOTDIR', 'not a directory');
    }
    return node.readnode(parts.join('/'), isFile);
  }

  public setNode(
    path: string,
    node: FsEntry | TestFileCrawlerDir | Buffer | string,
  ): void {
    const parts = path.split('/').filter(Boolean);
    const child = parts.pop();

    if (!child) {
      throw new Error(`setNode: expected path`);
    }

    const parent = parts.length ? this.readnode(parts.join('/'), false) : this;

    if (node instanceof TestFsDirEntry || node instanceof TestFsFileEntry) {
      parent.entries.set(child, node);
    } else if (typeof node === 'string' || Buffer.isBuffer(node)) {
      parent.entries.set(child, new TestFsFileEntry(node));
    } else {
      parent.entries.set(child, new TestFsDirEntry(node));
    }
  }

  public async stat(): Promise<DirectoryEntry> {
    return {
      isDirectory: () => true,
      isFile: () => false,
    };
  }
}
