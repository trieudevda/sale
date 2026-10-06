import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product)
  product!: Product;

  @Column()
  type!: string; // IN, OUT, RETURN, ADJUST

  @Column()
  quantity!: number;

  @Column({ nullable: true })
  referenceType!: string;

  @Column({ nullable: true })
  referenceId!: number;
}
