import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
    nullable: false,
  })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];
}
