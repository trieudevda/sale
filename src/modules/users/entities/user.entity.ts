import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';
import { Role } from '../../authorization/entities/roles.entity';

@Entity('users')
@Index('uq_users_phone', ['phone'], {
  unique: true,
})
@Index('uq_users_email', ['email'], {
  unique: true,
})
@Index('uq_users_username', ['username'], {
  unique: true,
})
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  email!: string;

  @Column({
    name: 'email_verified_at',
    type: 'datetime',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone!: string;

  @Column({
    name: 'phone_verified_at',
    type: 'datetime',
    nullable: true,
  })
  phoneVerifiedAt!: Date | null;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address!: string;

  @Column({ name: 'username', type: 'varchar', length: 100 })
  username!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'auth_version',
    type: 'int',
    unsigned: true,
    default: 0,
  })
  authVersion!: number;

  @ManyToMany(() => Role, (role) => role.users)
  roles!: Role[];

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
