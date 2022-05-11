import { object, optional, text } from '@fmtk/decoders';
import { AssetOptions, decodeAssetOptions } from './AssetOptions.js';
import { AssetOptionsMap, decodeAssetOptionsMap } from './AssetOptionsMap.js';

export interface CfnBoostConfig {
  assetPath?: string;
  assets?: AssetOptionsMap;
  defaults?: AssetOptions;
}

export const decodeCfnBoostConfig = object<CfnBoostConfig>({
  assetPath: optional(text),
  assets: optional(decodeAssetOptionsMap),
  defaults: optional(decodeAssetOptions),
});
