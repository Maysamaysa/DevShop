import { NestFactory } from '@nestjs/core';
import { InfraServiceModule } from './infra-service.module';

async function bootstrap() {
  const app = await NestFactory.create(InfraServiceModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
