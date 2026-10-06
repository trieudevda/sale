import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { PurchaseItem } from './purchase-item.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Supplier)
  supplier!: Supplier;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseOrder)
  items!: PurchaseItem[];

  @Column()
  status!: string;
}
