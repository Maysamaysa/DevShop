import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private redisSubscriber: Redis;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.redisSubscriber = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });

    void this.redisSubscriber.subscribe('order_events', (err) => {
      if (err) {
        console.error('Failed to subscribe to order_events', err);
      } else {
        console.log('Successfully subscribed to order_events channel.');
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'order_events') {
        this.handleOrderEvent(JSON.parse(message)).catch(console.error);
      }
    });
  }

  onModuleDestroy() {
    if (this.redisSubscriber) {
      this.redisSubscriber.disconnect();
    }
  }

  async handleOrderEvent(eventData: {
    event: string;
    orderId: string;
    userId: string;
    status?: string;
    newStatus?: string;
  }) {
    const { event, orderId, userId, status, newStatus } = eventData;

    let message = '';

    if (event === 'order_created') {
      message = `Your order ${orderId} has been created and is now ${status}.`;
    } else if (event === 'order_status_updated') {
      message = `Your order ${orderId} status has been updated to ${newStatus}.`;
    } else {
      return; // Ignore unknown events
    }

    // 1. Save IN_APP Notification to DB
    const notification = this.notificationRepository.create({
      userId,
      message,
      type: NotificationType.IN_APP,
    });
    await this.notificationRepository.save(notification);

    // 2. Push Real-time WebSocket Notification
    const sent = this.notificationGateway.sendNotificationToUser(
      userId,
      'notification',
      {
        id: notification.id,
        message,
        type: 'IN_APP',
        createdAt: notification.createdAt,
      },
    );

    // 3. Dispatch Async Email Notification to Queue
    await this.emailQueue.add('send-email', {
      userId,
      subject: `Order Update: ${orderId}`,
      body: message,
    });

    if (!sent) {
      console.log(
        `User ${userId} is currently offline. Notification saved to DB.`,
      );
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50
    });
  }
}
