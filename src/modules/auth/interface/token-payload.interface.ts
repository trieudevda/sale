export interface AccessTokenPayload {
  sub: string;
  username: string;
  // roles: string[];
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  username: string;
  tokenType: 'refresh';
  authVersion: number;
}