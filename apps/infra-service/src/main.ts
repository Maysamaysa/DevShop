import { NestFactory } from '@nestjs/core';
import './tracing';
import { getWinstonConfig } from '@app/common';

import { InfraServiceModule } from './infra-service.module';

async function bootstrap() {
  const app = await NestFactory.create(InfraServiceModule, {
    logger: getWinstonConfig('infra-service'),
  });
  await app.listen(process.env.PORT || 3005);
}
void bootstrap();
