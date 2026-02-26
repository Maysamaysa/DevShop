import { Test, TestingModule } from '@nestjs/testing';
import { InfraServiceController } from './infra-service.controller';
import { InfraServiceService } from './infra-service.service';

describe('InfraServiceController', () => {
  let infraServiceController: InfraServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InfraServiceController],
      providers: [InfraServiceService],
    }).compile();

    infraServiceController = app.get<InfraServiceController>(
      InfraServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(infraServiceController.getHello()).toBe('Hello World!');
    });
  });
});
