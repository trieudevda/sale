import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
@Index('uq_permissions_code', ['code'], {
  unique: true,
})
export class Permission {
  @PrimaryGeneratedColumn()
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
}