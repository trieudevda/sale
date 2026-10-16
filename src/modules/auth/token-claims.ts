import { UnauthorizedException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { TokenType } from './interface/token-payload.interface';
import type {
  AccessTokenPayload,
  BaseTokenPayload,
  RefreshTokenPayload,
} from './interface/token-payload.interface';

type CheckedBase = BaseTokenPayload & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUint(value: unknown, max: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= max
  );
}

function isBase(value: unknown): value is CheckedBase {
  return (
    isRecord(value) &&
    typeof value.sub === 'string' &&
    /^[1-9]\d{0,19}$/.test(value.sub) &&
    BigInt(value.sub) <= 18446744073709551615n &&
    typeof value.sid === 'string' &&
    isUUID(value.sid, '4') &&
    typeof value.username === 'string' &&
    value.username.length > 0 &&
    value.username.length <= 100 &&
    isUint(value.authVersion, 0xffffffff) &&
    isUint(value.iat, 253402300799) &&
    isUint(value.exp, 253402300799) &&
    value.exp > value.iat &&
    value.iat <= Math.floor(Date.now() / 1000) + 30 &&
    value.exp > Math.floor(Date.now() / 1000)
  );
}

export function assertAccessClaims(
  value: unknown,
): asserts value is AccessTokenPayload {
  if (!isBase(value) || value.tokenType !== TokenType.ACCESS) {
    throw new UnauthorizedException('Invalid access token');
  }
}

export function assertRefreshClaims(
  value: unknown,
): asserts value is RefreshTokenPayload {
  if (
    !isBase(value) ||
    value.tokenType !== TokenType.REFRESH ||
    typeof value.jti !== 'string' ||
    !isUUID(value.jti, '4')
  ) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
