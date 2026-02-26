import { Module } from '@nestjs/common';
import { InfraServiceController } from './infra-service.controller';
import { InfraServiceService } from './infra-service.service';

@Module({
  imports: [],
  controllers: [InfraServiceController],
  providers: [InfraServiceService],
})
export class InfraServiceModule {}
