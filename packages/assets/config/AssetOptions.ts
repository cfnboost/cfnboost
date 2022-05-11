import { array, object, optional, text } from '@fmtk/decoders';

export interface AssetOptions {
  archivePath?: string;
  exclude?: string[];
  include?: string[];
  rootPath?: string;
  workingDirectory?: string;
}

export const decodeAssetOptions = object<AssetOptions>({
  archivePath: optional(text),
  exclude: optional(array(text)),
  include: optional(array(text)),
  rootPath: optional(text),
  workingDirectory: optional(text),
});
