import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './roles.entity';

@Entity('permissions')
@Index('uq_permissions_code', ['code'], {
  unique: true,
})
export class Permission {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  code!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  module!: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
