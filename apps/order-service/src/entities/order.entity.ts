import { Entity, Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@app/database';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string; // Foreign key conceptually, but order service doesn't have User entity

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
