import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification-service.controller';
import { NotificationService } from './notification-service.service';

describe('NotificationController', () => {
  let controller: NotificationController;

  const mockNotificationService = {
    getUserNotifications: jest.fn((userId: string) =>
      Promise.resolve([{ id: '1', userId, message: 'Test message' }]),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
