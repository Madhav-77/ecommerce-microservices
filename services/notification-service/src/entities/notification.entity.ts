import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ nullable: false })
  type: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
