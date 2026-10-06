import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: string;
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  price!: string;
}
