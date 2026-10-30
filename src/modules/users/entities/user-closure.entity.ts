import { Column, Entity, PrimaryColumn } from 'typeorm';
import { uuidV7Transformer } from '../../../database/uuid-v7';

@Entity('user_closure')
export class UserClosure {
  @PrimaryColumn({
    name: 'ancestor_id',
    type: 'binary',
    length: 16,
    transformer: uuidV7Transformer,
  })
  ancestorId!: string;

  @PrimaryColumn({
    name: 'descendant_id',
    type: 'binary',
    length: 16,
    transformer: uuidV7Transformer,
  })
  descendantId!: string;

  @Column({
    type: 'smallint',
    unsigned: true,
  })
  depth!: number;
}
