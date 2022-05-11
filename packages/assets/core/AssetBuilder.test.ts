import { TestFileCrawler } from '../internal/TestFileCrawler.js';
import { AssetBuilder } from './AssetBuilder.js';
import { AssetPackage } from './AssetPackage.js';

describe(`AssetBuilder`, () => {
  describe(`build`, () => {
    it(`expands directories and adds all files`, async () => {
      const fs = new TestFileCrawler('/', {
        dir_a: {
          dir_b: {
            file_a: 'content a',
            file_b: 'content b',
          },
          file_c: 'content c',
        },
        dir_c: {
          file_d: 'content d',
        },
      });

      const addFile = jest.fn();
      const build = jest.fn();

      const asset: AssetPackage = {
        addFile,
        build,
      };

      const builder = new AssetBuilder(fs);

      await builder.build(
        {
          include: ['dir_a'],
        },
        asset,
      );

      expect(addFile).toHaveBeenCalledTimes(3);
      expect(addFile.mock.calls[0][0]).toEqual('/dir_a/dir_b/file_a');
      expect(addFile.mock.calls[1][0]).toEqual('/dir_a/dir_b/file_b');
      expect(addFile.mock.calls[2][0]).toEqual('/dir_a/file_c');
    });
  });
});
