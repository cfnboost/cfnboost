import { join, relative } from 'path';
import { AssetOptions } from '../config/AssetOptions.js';
import { AssetPackage } from './AssetPackage.js';
import { DirectoryEntryWithName } from './FileCrawler.js';
import { FsFileCrawler } from './FsFileCrawler.js';
import { matchPaths } from './matchPaths.js';

/**
 * Builds an {@link AssetPackage} from the given options.
 */
export class AssetBuilder {
  constructor(private readonly crawler = FsFileCrawler) {}

  /**
   * Builds an {@link AssetPackage} from the given options.
   */
  public async build(opts: AssetOptions, asset: AssetPackage): Promise<void> {
    if (!opts.include) {
      throw new Error(`"include" must be specified`);
    }

    const {
      archivePath = '/',
      exclude = [],
      include,
      workingDirectory = this.crawler.resolve('.'),
      rootPath = workingDirectory,
    } = opts;

    await this.buildInternal(
      workingDirectory,
      opts.include,
      {
        archivePath,
        include,
        workingDirectory,
        rootPath,
        exclude,
      },
      asset,
    );
  }

  private async buildInternal(
    basePath: string,
    files: (DirectoryEntryWithName | string)[],
    opts: Required<AssetOptions>,
    asset: AssetPackage,
  ): Promise<void> {
    const { createReadStream, resolve, readdir, stat } = this.crawler;
    const { archivePath, exclude, rootPath, workingDirectory } = opts;

    for (const source of files) {
      const sourceName = typeof source === 'string' ? source : source.name;
      const sourcePath = resolve(basePath, sourceName);

      if (matchPaths(sourcePath, exclude)) {
        continue;
      }

      const stats = typeof source === 'string' ? await stat(source) : source;

      if (stats.isDirectory()) {
        const files = await readdir(sourcePath);
        await this.buildInternal(sourcePath, files, opts, asset);
      } else if (stats.isFile()) {
        asset.addFile(
          join(
            archivePath,
            relative(join(workingDirectory, rootPath), sourcePath),
          ),
          () => createReadStream(sourcePath),
        );
      }
    }
  }
}
