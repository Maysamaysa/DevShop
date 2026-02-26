import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { InfraServiceController } from './infra-service.controller';
import { InfraServiceService } from './infra-service.service';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';

@Module({
  imports: [MetricsModule, PrometheusModule.register(), TerminusModule],
  controllers: [InfraServiceController, AppController],
  providers: [InfraServiceService],
})
export class InfraServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
