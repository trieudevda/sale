export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
export interface BaseTokenPayload {
  sub: string;
  sid: string;
  username: string;
  authVersion: number;
  iat: number;
  exp: number;
}
export interface AccessTokenPayload extends BaseTokenPayload {
  // roles: string[];
  tokenType: TokenType.ACCESS;
}

export interface RefreshTokenPayload extends BaseTokenPayload {
  tokenType: TokenType.REFRESH;
  jti: string;
}
