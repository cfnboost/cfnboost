import { Readable } from 'stream';
import { ZipAssetPackage } from './ZipAssetPackage.js';

describe(`ZipAssetPackage`, () => {
  describe(`build`, () => {
    it(`adds files in alphabetical order with zeroed date`, async () => {
      const fileZeroStream = Readable.from([`content0`]);
      const fileOneStream = Readable.from([`contentOne`]);
      const fileTwoStream = Readable.from([`contentTwo`]);
      const resultStream = Readable.from([`result`]);

      const append = jest.fn();
      const build = jest.fn(() => Promise.resolve(resultStream));

      const zipPackage = new ZipAssetPackage({
        archive: {
          append,
          build,
        },
      });

      zipPackage.addFile('zero', () => fileZeroStream);
      zipPackage.addFile('one', () => fileOneStream);
      zipPackage.addFile('two', () => fileTwoStream);

      const result = await zipPackage.build();

      expect(result).toBe(resultStream);
      expect(build).toHaveBeenCalledTimes(1);

      expect(append.mock.calls).toEqual([
        [{ path: 'one', date: new Date(0), content: fileOneStream }],
        [{ path: 'two', date: new Date(0), content: fileTwoStream }],
        [{ path: 'zero', date: new Date(0), content: fileZeroStream }],
      ]);
    });
  });
});
