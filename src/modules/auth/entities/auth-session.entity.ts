import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { uuidV7Transformer } from '../../../database/uuid-v7';

@Entity('auth_sessions')
@Index('ix_auth_sessions_user_id', ['userId'])
@Index('ix_auth_sessions_expires_at', ['expiresAt'])
@Index('uq_auth_sessions_refresh_jti', ['currentRefreshJti'], {
  unique: true,
})
export class AuthSession {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({
    name: 'user_id',
    type: 'binary',
    length: 16,
    transformer: uuidV7Transformer,
  })
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_auth_sessions_user',
  })
  user!: User;

  @Column({
    name: 'current_refresh_jti',
    type: 'varchar',
    length: 36,
  })
  currentRefreshJti!: string;

  @Column({
    name: 'expires_at',
    type: 'datetime',
    precision: 3,
  })
  expiresAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  revokedAt!: Date | null;
}
