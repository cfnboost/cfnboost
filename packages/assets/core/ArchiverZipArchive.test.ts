import { Readable } from 'stream';
import { ArchiverZipArchive } from './ArchiverZipArchive.js';

describe(`ArchiverZipArchive`, () => {
  it(`creates repeatable outputs`, async () => {
    const zip = new ArchiverZipArchive();

    zip.append({
      content: Readable.from(['content one']),
      date: new Date(0),
      path: 'one',
    });
    zip.append({
      content: Readable.from(['content two']),
      date: new Date(0),
      path: 'two',
    });

    const result = await zip.build();
    const chunks: Buffer[] = [];

    for await (const chunk of result) {
      chunks.push(chunk);
    }

    const content = Buffer.concat(chunks).toString(`base64`);

    expect(content).toEqual(
      'UEsDBBQACAAIAAAAIQAAAAAAAAAAAAAAAAADAAAAb25lS87PK0nNK1HIz0sFAFBLBwjOYNv8DQAAAAsAAABQSwMEFAAIAAgAAAAhAAAAAAAAAAAAAAAAAAMAAAB0d29Lzs8rSc0rUSgpzwcAUEsHCFlsfZcNAAAACwAAAFBLAQItAxQACAAIAAAAIQDOYNv8DQAAAAsAAAADAAAAAAAAAAAAIACkgQAAAABvbmVQSwECLQMUAAgACAAAACEAWWx9lw0AAAALAAAAAwAAAAAAAAAAACAApIE+AAAAdHdvUEsFBgAAAAACAAIAYgAAAHwAAAAAAA==',
    );
  });
});
