import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/database';

export enum NotificationType {
    EMAIL = 'email',
    IN_APP = 'in_app',
    PUSH = 'push',
}

@Entity('notifications')
export class Notification extends BaseEntity {
    @Column({ type: 'uuid' })
    userId: string; // Recipient

    @Column()
    message: string;

    @Column({ type: 'enum', enum: NotificationType, default: NotificationType.IN_APP })
    type: NotificationType;
}
