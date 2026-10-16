export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
export interface AccessTokenPayload {
  sub: string;
  username: string;
  // roles: string[];
  tokenType: TokenType.ACCESS;
  authVersion: number;
}

export interface RefreshTokenPayload {
  sub: string;
  username: string;
  tokenType: TokenType.REFRESH;
  authVersion: number;
  jti: string;
  exp?: number;
}
