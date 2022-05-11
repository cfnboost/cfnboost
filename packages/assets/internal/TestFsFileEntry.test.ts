import { TestFsFileEntry } from './TestFsFileEntry.js';

describe('TestFsFileEntry', () => {
  describe('createReadStream()', () => {
    it('returns the contents in buffer mode', async () => {
      const contents = 'hello world';
      const entry = new TestFsFileEntry(contents);

      const stream = entry.createReadStream();

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const readStr = Buffer.concat(chunks).toString('utf8');

      expect(readStr).toEqual(contents);
    });

    it('returns the contents in string mode', async () => {
      const contents = 'hello world';
      const entry = new TestFsFileEntry(contents);

      const stream = entry.createReadStream();

      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const readStr = chunks.join();

      expect(readStr).toEqual(contents);
    });
  });

  describe('createWriteStream()', () => {
    it('overwrites the contents', async () => {
      const contents = 'hello world';
      const entry = new TestFsFileEntry(contents);

      const stream = entry.createWriteStream();
      stream.write('hallo');
      await new Promise((res) => stream.end(res));

      expect(entry.contents.toString()).toEqual('hallo');
    });

    it('works in string mode', async () => {
      const contents = 'hello world';
      const entry = new TestFsFileEntry(contents);

      const stream = entry.createWriteStream('utf8');
      stream.write('hallo');
      await new Promise((res) => stream.end(res));

      expect(entry.contents.toString()).toEqual('hallo');
    });

    it('works in base64 mode', async () => {
      const contents = 'hello world';
      const entry = new TestFsFileEntry(contents);

      const stream = entry.createWriteStream('base64');
      stream.write('aGFsbG8=');
      await new Promise((res) => stream.end(res));

      expect(entry.contents.toString()).toEqual('hallo');
    });
  });

  describe('readFile()', () => {
    it('returns the entire contents as a Buffer', async () => {
      const contents = 'hallo';
      const entry = new TestFsFileEntry(contents);

      const result = await entry.readFile();

      const expected = Buffer.from(contents);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.equals(expected)).toBe(true);
    });

    it('returns the entire contents as a string with encoding', async () => {
      const contents = 'hallo';
      const entry = new TestFsFileEntry(contents);

      const result = await entry.readFile('base64');

      expect(result).toEqual('aGFsbG8=');
    });
  });

  describe('stat()', () => {
    it('returns the correct value', async () => {
      const contents = 'hallo';
      const entry = new TestFsFileEntry(contents);

      const result = await entry.stat();

      expect(result.isDirectory()).toBe(false);
      expect(result.isFile()).toBe(true);
    });
  });
});
