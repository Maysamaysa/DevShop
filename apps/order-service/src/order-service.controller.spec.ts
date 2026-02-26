import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order-service.controller';
import { OrderService } from './order-service.service';
import { OrderStatus } from './entities/order.entity';

describe('OrderController', () => {
  let controller: OrderController;

  const mockOrderService = {
    create: jest.fn((userId: string, dto: Record<string, unknown>) =>
      Promise.resolve({ id: '1', userId, ...dto }),
    ),
    findAll: jest.fn(() =>
      Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
    ),
    findOne: jest.fn((id: string) =>
      Promise.resolve({ id, status: OrderStatus.PENDING }),
    ),
    updateStatus: jest.fn((id: string, dto: Record<string, unknown>) =>
      Promise.resolve({ id, ...dto }),
    ),
    softDelete: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
