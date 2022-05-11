import { assert } from '@fmtk/decoders';
import { basename, extname, join } from 'path';
import { FsReadFile, FsResolve, FsStat } from '../core/FileCrawler.js';
import { FsFileCrawler } from '../core/FsFileCrawler.js';
import { CfnBoostConfig } from './CfnBoostConfig.js';
import { decodePackageAssetsConfig } from './PackageAssetsConfig.js';

export class ConfigLoader {
  constructor(
    private readonly fs: {
      readFile: FsReadFile;
      resolve: FsResolve;
      stat: FsStat;
    } = FsFileCrawler,
  ) {}

  public async load(path = '.'): Promise<CfnBoostConfig | undefined> {
    const stat = await this.fs.stat(path);

    if (stat.isFile()) {
      const cfg = await this.fromFile(path);
      if (!cfg) {
        throw new Error(`the specified config '${path}' cannot be loaded`);
      }
      return cfg;
    }

    for (const file of [
      join(path, 'cfnboost.config.json'),
      join(path, 'cfnboost.config.js'),
      join(path, 'package.json'),
    ]) {
      try {
        const stat = await this.fs.stat(file);
        if (!stat.isFile()) {
          continue;
        }
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          throw err;
        }
        continue;
      }
      const cfg = await this.fromFile(file);
      if (cfg) {
        return cfg;
      }
    }
  }

  private async fromFile(path: string): Promise<CfnBoostConfig | undefined> {
    let cfg: any;

    try {
      if (extname(path) === '.js') {
        cfg = await import(path);
      } else if (basename(path) === 'package.json') {
        cfg = JSON.parse(await this.fs.readFile(path, 'utf8'))?.cfnboost;
      } else {
        cfg = JSON.parse(await this.fs.readFile(path, 'utf8'));
      }
      if (!cfg) {
        return;
      }
      return assert(decodePackageAssetsConfig, cfg);
    } catch (err) {
      console.warn(`warning: error loading config '${path}':`, err);
    }
  }
}
