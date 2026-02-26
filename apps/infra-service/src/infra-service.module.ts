import { Module } from '@nestjs/common';
import { InfraServiceController } from './infra-service.controller';
import { InfraServiceService } from './infra-service.service';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';

@Module({
  imports: [TerminusModule],
  controllers: [InfraServiceController, AppController],
  providers: [InfraServiceService],
})
export class InfraServiceModule {}
