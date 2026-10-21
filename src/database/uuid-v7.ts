import { parse, stringify, validate, version } from 'uuid';
import type { ValueTransformer } from 'typeorm';

export function isUuidV7(value: unknown): value is string {
  return typeof value === 'string' && validate(value) && version(value) === 7;
}

export function uuidV7ToBuffer(id: string): Buffer {
  if (!isUuidV7(id)) {
    throw new TypeError('Invalid UUIDv7');
  }

  return Buffer.from(parse(id));
}

export const uuidV7Transformer: ValueTransformer = {
  to(value: string | null | undefined) {
    return value == null ? null : uuidV7ToBuffer(value);
  },

  from(value: Buffer | string | null | undefined) {
    if (value == null) {
      return null;
    }

    if (typeof value === 'string') {
      if (!isUuidV7(value)) {
        throw new TypeError('Invalid UUIDv7');
      }

      return value;
    }

    if (value.length !== 16) {
      throw new TypeError('Invalid UUIDv7 binary value');
    }

    const id = stringify(value);
    if (!isUuidV7(id)) {
      throw new TypeError('Invalid UUIDv7 binary value');
    }

    return id;
  },
};
