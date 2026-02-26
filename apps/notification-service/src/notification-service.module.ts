import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './notification-service.controller';
import { NotificationService } from './notification-service.service';
import { Notification } from './entities/notification.entity';
import { WsAuthService } from './ws-auth.service';
import { NotificationGateway } from './notification.gateway';
import { EmailProcessor } from './email.processor';
import { AppController } from './app.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Notification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret_key'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [NotificationController, AppController],
  providers: [
    NotificationService,
    WsAuthService,
    NotificationGateway,
    EmailProcessor,
  ],
})
export class NotificationServiceModule {}
