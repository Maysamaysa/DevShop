#!/bin/bash
APPS=("api-gateway" "auth-service" "order-service" "notification-service" "infra-service")

for APP in "${APPS[@]}"; do
  # Create tracing.ts
  cat << TRACE > apps/$APP/src/tracing.ts
/* eslint-disable */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporterOptions = {
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
};

const traceExporter = new JaegerExporter(exporterOptions);

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: '$APP',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
TRACE

  # Create metrics.middleware.ts
  mkdir -p apps/$APP/src/metrics
  cat << METRICS > apps/$APP/src/metrics/metrics.middleware.ts
/* eslint-disable */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const end = this.requestDuration.startTimer();
    res.on('finish', () => {
      const route = (req as any).route ? ((req as any).route.path as string) : req.path;
      this.requestsTotal.labels(req.method, route, res.statusCode.toString()).inc();
      end({ method: req.method, route, status_code: res.statusCode.toString() });
    });
    next();
  }
}
METRICS

  # Create metrics.module.ts
  cat << METRICSMOD > apps/$APP/src/metrics/metrics.module.ts
/* eslint-disable */
import { Module } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
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
  exports: [MetricsMiddleware, httpRequestsTotalProvider, httpRequestDurationProvider],
})
export class MetricsModule {}
METRICSMOD

done
