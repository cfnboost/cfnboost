import { pipeline as _pipeline } from 'stream';
import { promisify } from 'util';

export const pipeline = promisify(_pipeline);
