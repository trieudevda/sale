import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { User } from './user.entity';
import { Role } from '../../authorization/entities/roles.entity';
import { uuidV7Transformer } from '../../../database/uuid-v7';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({
    name: 'user_id',
    type: 'binary',
    length: 16,
    transformer: uuidV7Transformer,
  })
  userId!: string;

  @PrimaryColumn({
    name: 'role_id',
    type: 'bigint',
    unsigned: true,
  })
  roleId!: string;

  @ManyToOne(() => User, (user) => user.roleAssignments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}
