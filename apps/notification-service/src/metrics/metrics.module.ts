import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsMiddleware } from './metrics.middleware';

export const httpRequestsTotalProvider = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDurationProvider = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

@Module({
  providers: [
    httpRequestsTotalProvider,
    httpRequestDurationProvider,
    MetricsMiddleware,
  ],
  exports: [
    MetricsMiddleware,
    httpRequestsTotalProvider,
    httpRequestDurationProvider,
  ],
})
export class MetricsModule {}
