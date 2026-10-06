import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Role } from './roles.entity';
import { Permission } from './permissions.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({
    name: 'role_id',
    type: 'int',
    // unsigned: true,
  })
  roleId!: number;

  @PrimaryColumn({
    name: 'permission_id',
    type: 'int', 
    // unsigned: true,
  })
  permissionId!: number;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

  @ManyToOne(() => Permission)
  @JoinColumn({
    name: 'permission_id',
  })
  permission!: Permission;
}
