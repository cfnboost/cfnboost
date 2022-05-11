import { createReadStream, createWriteStream } from 'fs';
import { readdir, readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { FileCrawler } from './FileCrawler.js';

export const FsFileCrawler: FileCrawler = {
  createReadStream,
  createWriteStream,
  readdir: async (path) => readdir(path, { withFileTypes: true }),
  readFile: async (path, encoding) => readFile(path, encoding),
  resolve,
  stat,
};
