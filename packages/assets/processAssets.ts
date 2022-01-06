import { Template } from '@cfnboost/template';
import PromisePool from '@supercharge/promise-pool';
import { AssetBuilder } from './AssetBuilder.js';
import { AssetDescriptor, AssetMetadataSection } from './AssetDescriptor.js';
import { DeploymentBundle } from './DeploymentBundle.js';

/**
 * Take a template with unprocessed assets in the metadata, add those assets to
 * a deployment bundle, and output the vanilla cloudformation template for
 * consumption by standard tools.
 *
 * @param template The template optionally containing unprocessed assets.
 * @param bundle A deployment bundle to add assets to.
 * @param options Options to control processing of the assets.
 * @returns
 */
export async function processAssets(
  template: Template,
  bundle: DeploymentBundle,
  options: {
    maxConcurrency?: number;
  } = {},
): Promise<Template> {
  if (!template.Metadata || !template.Metadata[AssetMetadataSection]) {
    return template;
  }

  const { maxConcurrency = 4 } = options;
  const assets = template.Metadata[AssetMetadataSection] as AssetBuilder[];

  return {
    ...template,

    Metadata: {
      ...template.Metadata,

      [AssetMetadataSection]: await PromisePool.for(assets)
        .withConcurrency(maxConcurrency)
        .process(
          async (asset): Promise<AssetDescriptor> =>
            asset.build // don't try to process again if already done
              ? {
                  BucketParam: asset.BucketParam,
                  FileName: await bundle.addAsset(
                    asset.FileName,
                    await asset.build(),
                  ),
                  KeyParam: asset.KeyParam,
                  Name: asset.Name,
                }
              : asset,
        ),
    },
  };
}
