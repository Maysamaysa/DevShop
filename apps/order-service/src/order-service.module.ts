import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order-service.controller';
import { OrderService } from './order-service.service';
import { Order } from './entities/order.entity';
import { RedisPubSubModule } from '@app/common';
import { AppController } from './app.controller';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';

@Module({
  imports: [
    MetricsModule,
    PrometheusModule.register(),
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Order]),
    RedisPubSubModule, // To allow publishing events
  ],
  controllers: [OrderController, AppController],
  providers: [OrderService],
})
export class OrderServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
