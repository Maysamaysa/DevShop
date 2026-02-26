import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per ttl
      },
    ]),
  ],
  controllers: [ApiGatewayController, AppController],
  providers: [
    ApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');

    // Proxy Auth Service
    consumer
      .apply(
        createProxyMiddleware({
          target: this.configService.get(
            'AUTH_SERVICE_URL',
            'http://localhost:3001',
          ),
          changeOrigin: true,
          pathRewrite: {
            '^/api/auth': '',
          },
        }),
      )
      .forRoutes('/api/auth');

    // Proxy Order Service
    consumer
      .apply(
        createProxyMiddleware({
          target: this.configService.get(
            'ORDER_SERVICE_URL',
            'http://localhost:3002',
          ),
          changeOrigin: true,
          pathRewrite: {
            '^/api/orders': '',
          },
        }),
      )
      .forRoutes('/api/orders');

    // Proxy Notification Service
    consumer
      .apply(
        createProxyMiddleware({
          target: this.configService.get(
            'NOTIFICATION_SERVICE_URL',
            'http://localhost:3003',
          ),
          changeOrigin: true,
          pathRewrite: {
            '^/api/notifications': '',
          },
        }),
      )
      .forRoutes('/api/notifications');
  }
}
