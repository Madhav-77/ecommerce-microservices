import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: false })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: false,
  })
  status: PaymentStatus;

  @Column({ nullable: false })
  provider: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
