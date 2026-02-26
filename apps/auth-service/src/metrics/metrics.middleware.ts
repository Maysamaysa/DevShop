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
