import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Redis } from 'ioredis';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { REDIS_CLIENT } from '@app/common';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      userId,
      totalAmount: createOrderDto.totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Publish created event
    await this.redisClient.publish(
      'order_events',
      JSON.stringify({
        event: 'order_created',
        orderId: savedOrder.id,
        userId,
        status: savedOrder.status,
      }),
    );

    return savedOrder;
  }

  async findAll(
    queryDto: QueryOrdersDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const { status, startDate, endDate, page = 1, limit = 10 } = queryDto;

    const where: FindOptionsWhere<Order> = {};
    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    const oldStatus = order.status;
    order.status = updateDto.status;

    const updatedOrder = await this.orderRepository.save(order);

    if (oldStatus !== updatedOrder.status) {
      // Emit event via Redis pub/sub when order status changes
      await this.redisClient.publish(
        'order_events',
        JSON.stringify({
          event: 'order_status_updated',
          orderId: updatedOrder.id,
          userId: updatedOrder.userId,
          oldStatus,
          newStatus: updatedOrder.status,
        }),
      );
    }

    return updatedOrder;
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.orderRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
