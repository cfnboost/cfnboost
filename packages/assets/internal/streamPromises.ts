import stream from 'stream';
import util from 'util';

export const streamPipeline = util.promisify(stream.pipeline);
export const streamFinished = util.promisify(stream.finished);
