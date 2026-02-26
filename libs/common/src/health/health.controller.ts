import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  checkHealth() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  checkReady() {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
