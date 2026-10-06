import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductPrice } from './product-prices.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices!: ProductPrice[];
}
