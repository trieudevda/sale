import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Product)
  @JoinColumn()
  product!: Product;

  @Column({ type: 'int', default: 0 })
  quantity!: number;
}
