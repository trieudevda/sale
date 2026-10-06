import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './roles.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
  })
  userId!: string;

  @PrimaryColumn({
    name: 'role_id',
    type: 'bigint',
    unsigned: true,
  })
  roleId!: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;
}
