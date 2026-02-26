import { NestFactory } from '@nestjs/core';
import './tracing';
import { getWinstonConfig } from '@app/common';

import { OrderServiceModule } from './order-service.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule, {
    logger: getWinstonConfig('order-service'),
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('The Order Service API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Order service running on port ${port}`);
}
void bootstrap();
