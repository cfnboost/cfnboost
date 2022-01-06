import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import PromisePool from '@supercharge/promise-pool';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import stream from 'stream';
import tempy from 'tempy';
import { TypedEmitter } from 'tiny-typed-emitter';
import { v4 as uuid } from 'uuid';
import { HashStream } from './HashStream.js';
import { ProgressStream } from './internal/ProgressStream.js';
import { streamPipeline } from './internal/streamPromises.js';
import { ProgressStats } from './ProgressStats';

export interface AddAssetOpts {
  keepName?: boolean;
}

export interface DeploymentBundle {
  addAsset(
    fileName: string,
    stream: stream.Readable,
    opts?: AddAssetOpts,
  ): PromiseLike<string>;
}

export interface FileSystemBundleOptions {
  stagingDirectory?: string;
}

export interface FileSystemDeploymentBundleEvents {
  assetProgress(name: string, stats: ProgressStats): void;
  assetRename(oldName: string, rename: string): void;
  assetUploadProgress(name: string, stats: ProgressStats): void;
}

interface AssetEntry {
  name: string;
  path: string;
}

export class FileSystemDeploymentBundle
  extends TypedEmitter<FileSystemDeploymentBundleEvents>
  implements DeploymentBundle
{
  private readonly outputDir: string;
  private readonly assets: AssetEntry[] = [];

  constructor(options: FileSystemBundleOptions) {
    super();
    this.outputDir = options.stagingDirectory ?? tempy.directory();
  }

  public async addAsset(
    fileName: string,
    content: stream.Readable,
    opts: AddAssetOpts = {},
  ): Promise<string> {
    if (path.dirname(fileName) !== '.') {
      throw new Error(`the fileName must not be within a directory`);
    }

    this.emit('assetProgress', fileName, {});

    const outDir = await this.getOutputDir();
    const originalExt = path.extname(fileName);
    const originalBasename = path.basename(fileName, originalExt);
    const stagingExt = `.stagingprogress_${uuid()}`;

    const outPath = path.join(outDir, fileName + stagingExt);
    const outStream = fs.createWriteStream(outPath);

    const progress = new ProgressStream((total) =>
      this.emit('assetProgress', fileName, { total }),
    );
    progress.on('finish', () =>
      this.emit('assetProgress', fileName, { complete: true }),
    );

    if (opts.keepName) {
      await streamPipeline(content, progress, outStream);

      const finalPath = path.join(outDir, originalBasename + originalExt);
      await fs.promises.rename(outPath, finalPath);

      this.assets.push({ name: fileName, path: finalPath });
      return fileName;
    } else {
      const hashStream = new HashStream();

      await streamPipeline(content, progress, hashStream, outStream);
      const sha = hashStream.digest('hex');

      const finalBasename = originalBasename + `.${sha}` + originalExt;
      const finalPath = path.join(outDir, finalBasename);

      await fs.promises.rename(outPath, finalPath);
      this.emit('assetRename', fileName, finalBasename);

      this.assets.push({ name: finalBasename, path: finalPath });
      return finalBasename;
    }
  }

  public async upload({
    bucket,
    maxConcurrency = 5,
    s3Config,
    s3 = new S3Client(s3Config ?? {}),
  }: {
    bucket: string;
    maxConcurrency?: number;
    s3?: S3Client;
    s3Config?: S3ClientConfig;
  }): Promise<void> {
    await PromisePool.for(this.assets)
      .withConcurrency(maxConcurrency)
      .handleError((error) => {
        throw error;
      })
      .process(async (asset) => {
        const stat = await fs.promises.stat(asset.path);
        const content = fs.createReadStream(asset.path);

        const upload = new Upload({
          client: s3,
          params: {
            Body: content,
            Bucket: bucket,
            Key: asset.name,
          },
        });

        upload.on('httpUploadProgress', (progress) =>
          this.emit('assetUploadProgress', asset.name, {
            progress: progress.loaded,
            total: progress.total ?? stat.size,
          }),
        );

        await upload.done();

        this.emit('assetUploadProgress', asset.name, {
          complete: true,
        });
      });
  }

  private getOutputDir = (() => {
    let created = false;
    return async () => {
      if (!created) {
        await fsPromises.mkdir(this.outputDir, { recursive: true });
        created = true;
      }
      return this.outputDir;
    };
  })();
}
