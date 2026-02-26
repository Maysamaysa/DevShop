import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    register: jest.fn(() =>
      Promise.resolve({ id: '1', email: 'test@example.com' }),
    ),
    login: jest.fn(() =>
      Promise.resolve({ accessToken: 'acc_token', refreshToken: 'ref_token' }),
    ),
    refresh: jest.fn(() =>
      Promise.resolve({
        accessToken: 'new_acc_token',
        refreshToken: 'new_ref_token',
      }),
    ),
    logout: jest.fn(() =>
      Promise.resolve({ message: 'Logged out successfully' }),
    ),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(authController).toBeDefined();
    });
  });
});
