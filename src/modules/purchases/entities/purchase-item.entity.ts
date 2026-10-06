import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PurchaseOrder } from './purchase.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PurchaseOrder, (purchase) => purchase.items)
  purchaseOrder!: PurchaseOrder;

  @ManyToOne(() => Product)
  product!: Product;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitCost!: string;
}
