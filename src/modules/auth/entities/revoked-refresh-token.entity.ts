import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('revoked_refresh_tokens')
export class RevokedRefreshToken {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  jti!: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;
}
