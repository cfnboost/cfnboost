import merge from 'lodash.merge';
import { dirname, join } from 'path';
import { CfnBoostConfig } from '../config/CfnBoostConfig.js';
import { ConfigLoader } from '../config/ConfigLoader.js';
import { pipeline } from '../internal/pipeline.js';
import { AssetBuilder } from './AssetBuilder.js';
import { FileCrawler } from './FileCrawler.js';
import { FsFileCrawler } from './FsFileCrawler.js';
import { ZipArchive } from './ZipArchive.js';
import { ZipAssetPackage } from './ZipAssetPackage.js';

export interface PackageAssetBuilderOptions {
  config?: CfnBoostConfig | string;
  only?: string[];
  outputPath?: string;
}

export class PackageAssetBuilder {
  public static readonly DefaultOutputDir = 'dist';

  private readonly archive?: ZipArchive;
  private readonly fs: FileCrawler;

  constructor(deps?: { archive?: ZipArchive; fs?: FileCrawler }) {
    this.archive = deps?.archive;
    this.fs = deps?.fs ?? FsFileCrawler;
  }

  public async build(opts: PackageAssetBuilderOptions): Promise<void> {
    const { archive, fs } = this;
    let config = opts.config;
    const configPath = typeof config === 'string' ? dirname(config) : undefined;

    if (!config || typeof config === 'string') {
      const loader = new ConfigLoader(fs);
      config = await loader.load(configPath);
    }

    if (!config) {
      throw new Error(`unable to load config`);
    }
    if (!config.assets) {
      return;
    }

    const outputPath = fs.resolve(
      opts.outputPath ||
        config.assetPath ||
        configPath ||
        PackageAssetBuilder.DefaultOutputDir,
    );

    const only = opts.only
      ? new Set(opts.only.map((x) => x.trim()).filter(Boolean))
      : undefined;

    const assets = Object.entries(config.assets);
    const builder = new AssetBuilder(fs);

    for (const [name, spec] of assets) {
      if (only && !only.has(name)) {
        continue;
      }
      const asset = new ZipAssetPackage({ archive });
      const specArray = Array.isArray(spec) ? spec : [spec];

      for (const spec of specArray) {
        await builder.build(merge({}, config.defaults, spec), asset);
      }

      const assetOutput = await asset.build();
      const writer = fs.createWriteStream(join(outputPath, `${name}.zip`));
      await pipeline(assetOutput, writer);
    }
  }
}
