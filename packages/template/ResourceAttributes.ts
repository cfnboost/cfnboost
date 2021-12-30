import {
  AttributeTypeFor,
  ResourceAttributes,
  ResourceType,
} from '@cfnboost/resources';
import { Fn } from './Fn.js';

export function makeResourceAttributes<T extends object>(
  logicalResourceId: string,
  names?: (keyof T)[],
): T {
  return new Proxy(Object.create(null), {
    get: (_, name) => {
      if (typeof name === 'string') {
        if (!names || (names as string[]).includes(name)) {
          return Fn.getAtt(logicalResourceId, name);
        }
      }
      throw new Error(`attribute name '${String(name)} not valid`);
    },
  }) as T;
}

export function makeAwsResourceAttributes<T extends ResourceType>(
  logicalResourceId: string,
  type: T,
): AttributeTypeFor<T> {
  return makeResourceAttributes<AttributeTypeFor<T>>(
    logicalResourceId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResourceAttributes[type] as any,
  );
}
