import { array, choose, record, text } from '@fmtk/decoders';
import { AssetOptions, decodeAssetOptions } from './AssetOptions.js';

export interface AssetOptionsMap {
  [key: string]: AssetOptions | AssetOptions[];
}

export const decodeAssetOptionsMap = record(
  text,
  choose(decodeAssetOptions, array(decodeAssetOptions)),
);
