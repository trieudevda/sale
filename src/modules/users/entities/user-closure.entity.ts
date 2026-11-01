import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { uuidV7Transformer } from '../../../database/uuid-v7';

@Entity('user_closure')
@Index('idx_user_closure_descendant', ['descendantId', 'ancestorId'])
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
