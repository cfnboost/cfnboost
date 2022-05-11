import { array, choose, object, optional, record, text } from '@fmtk/decoders';
import { AssetOptions, decodeAssetOptions } from './AssetOptions.js';

export interface PackageAssetsConfig {
  defaults?: AssetOptions;
  assets: Record<string, AssetOptions | AssetOptions[]>;
}

export const decodePackageAssetsConfig = object<PackageAssetsConfig>({
  defaults: optional(decodeAssetOptions),
  assets: record(text, choose(decodeAssetOptions, array(decodeAssetOptions))),
});
