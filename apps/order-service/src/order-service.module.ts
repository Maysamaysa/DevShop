import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order-service.controller';
import { OrderService } from './order-service.service';
import { Order } from './entities/order.entity';
import { RedisPubSubModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Order]),
    RedisPubSubModule, // To allow publishing events
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderServiceModule {}
