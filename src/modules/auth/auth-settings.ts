import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function secret(config: ConfigService, key: string): string {
  const value = config.getOrThrow<unknown>(key);

  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    Buffer.byteLength(value, 'utf8') < 32
  ) {
    throw new Error(`${key} must contain at least 32 bytes`);
  }

  return value;
}

function ttl(config: ConfigService, key: string, max: number): number {
  const value = config.getOrThrow<unknown>(key);

  const match =
    typeof value === 'string'
      ? /^([1-9]\d*)(s|m|h|d)$/.exec(value.trim())
      : null;

  if (!match) {
    throw new Error(`${key} must use s, m, h, or d`);
  }

  const unit = match[2];
  const multiplier =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;

  const seconds = Number(match[1]) * multiplier;

  if (!Number.isSafeInteger(seconds) || seconds > max) {
    throw new Error(`${key} is out of range`);
  }

  return seconds;
}

@Injectable()
export class AuthSettings {
  readonly accessSecret: string;
  readonly refreshSecret: string;
  readonly accessTtl: number;
  readonly refreshTtl: number;

  readonly issuer = 'sale-api';
  readonly accessAudience = 'sale-access';
  readonly refreshAudience = 'sale-refresh';

  constructor(config: ConfigService) {
    this.accessSecret = secret(config, 'JWT_ACCESS_SECRET');
    this.refreshSecret = secret(config, 'JWT_REFRESH_SECRET');

    if (this.accessSecret === this.refreshSecret) {
      throw new Error('Access and refresh secrets must differ');
    }

    this.accessTtl = ttl(config, 'JWT_ACCESS_EXPIRES_IN', 3600);

    this.refreshTtl = ttl(config, 'JWT_REFRESH_EXPIRES_IN', 90 * 86400);

    if (this.refreshTtl < this.accessTtl) {
      throw new Error('Refresh TTL must be at least the access TTL');
    }
  }
}
