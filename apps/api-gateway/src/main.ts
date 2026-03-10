import { NestFactory } from '@nestjs/core';
import './tracing';
import { getWinstonConfig } from '@app/common';

import { ApiGatewayModule } from './api-gateway.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    logger: getWinstonConfig('api-gateway'),
  });

  // Setup Request Logging
  app.use(morgan('combined'));

  // Gateway typically runs on port 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway is running on port ${port}`);
}
void bootstrap();
