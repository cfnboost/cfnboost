import crypto from 'crypto';
import stream from 'stream';

export class HashStream extends stream.Transform {
  private readonly hash: crypto.Hash;

  constructor(
    algorithm?: string | crypto.Hash,
    options?: stream.TransformOptions,
  ) {
    super(options);

    if (!algorithm) {
      algorithm = 'sha1';
    }
    this.hash =
      typeof algorithm === 'string' ? crypto.createHash(algorithm) : algorithm;
  }

  public digest(): Buffer;
  public digest(encoding: crypto.BinaryToTextEncoding): string;
  public digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
    return encoding ? this.hash.digest(encoding) : this.hash.digest();
  }

  public override _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: stream.TransformCallback,
  ): void {
    try {
      this.hash.update(chunk);
      callback(null, chunk);
    } catch (err: any) {
      callback(err);
    }
  }
}
