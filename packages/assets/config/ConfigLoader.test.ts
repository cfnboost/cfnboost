import { TestFileCrawler } from '../internal/TestFileCrawler.js';
import { CfnBoostConfig } from './CfnBoostConfig.js';
import { ConfigLoader } from './ConfigLoader.js';

describe('ConfigLoader', () => {
  describe('load', () => {
    it(`returns undefined if package file doesn't exist`, async () => {
      const fs = new TestFileCrawler('/', {});
      const loader = new ConfigLoader(fs);

      const result = await loader.load();
      expect(result).toBeUndefined();
    });

    it(`returns undefined if package file has invalid JSON`, async () => {
      const fs = new TestFileCrawler('/', {
        'package.json': '{',
      });
      const loader = new ConfigLoader(fs);

      const result = await loader.load();
      expect(result).toBeUndefined();
    });

    it(`reads from the package.json file`, async () => {
      const fs = new TestFileCrawler(`/working`, {
        working: {
          'package.json': JSON.stringify({}),
        },
      });

      const loader = new ConfigLoader(fs);

      await loader.load();
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile.mock.calls[0][0]).toEqual('package.json');
    });

    it(`reads from the cfnboost.config.js file`, async () => {
      const fs = new TestFileCrawler(`/working`, {
        working: {
          'cfnboost.config.js': `export default `,
        },
      });

      const loader = new ConfigLoader(fs);

      await loader.load();
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile.mock.calls[0][0]).toEqual('package.json');
    });

    it(`reads from the package.json file in the given working directory`, async () => {
      const fs = new TestFileCrawler(`/working`, {
        foo: {
          bar: { 'package.json': JSON.stringify({}) },
        },
      });

      const loader = new ConfigLoader(fs);

      await loader.load('/foo/bar');
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile.mock.calls[0][0]).toEqual('/foo/bar/package.json');
    });

    it(`returns the config if it exists`, async () => {
      const config: CfnBoostConfig = {
        assets: {
          something: {
            include: ['hello'],
          },
        },
      };

      const fs = new TestFileCrawler('/working', {
        working: {
          'package.json': JSON.stringify({ name: 'foo', cfnboost: config }),
        },
      });

      const loader = new ConfigLoader(fs);

      const result = await loader.load();
      expect(result).toEqual(config);
    });

    it(`returns undefined if the config is invalid`, async () => {
      const fs = new TestFileCrawler('/', {
        'package.json': JSON.stringify({
          cfnboost: {
            someInvalidKey: 42,
          },
        }),
      });

      const loader = new ConfigLoader(fs);
      const cfg = await loader.load();

      expect(cfg).toBeUndefined();
    });
  });
});
