import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permissions.entity';
// import { RoleSource } from './enums/user-role-source.enum';
import { User } from '../../users/entities/user.entity';
import { RoleSource } from '../enums/user-role-source.enum';
import { UserRole } from '../../users/entities/user-role.entity';

@Entity('roles')
@Index('uq_roles_code', ['code'], {
  unique: true,
})
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  code!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'enum',
    enum: RoleSource,
    default: RoleSource.CUSTOM,
  })
  source!: RoleSource;

  @Column({
    name: 'level',
    type: 'smallint',
    unsigned: true,
  })
  level!: number;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',

    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions!: Permission[];

  // @ManyToMany(() => User, (user) => user.roles)
  // users!: User[];
}
