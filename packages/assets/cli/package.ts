import { Command } from 'commander';
import { PackageAssetBuilder } from '../core/PackageAssetBuilder.js';

export function addPackageCommand(program: Command): void {
  program
    .command('package')
    .description('build all assets for a package')
    .option('--config <path>', 'path to package.json')
    .option('--only <...name>', 'build only the named asset')
    .option('--output-path <path>', 'folder to save assets in')
    .action(async ({ config, only, outputPath }) => {
      await new PackageAssetBuilder().build({
        config,
        only,
        outputPath,
      });
    });
}
