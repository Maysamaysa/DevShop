import { Controller, Get } from '@nestjs/common';
import { InfraServiceService } from './infra-service.service';

@Controller()
export class InfraServiceController {
  constructor(private readonly infraServiceService: InfraServiceService) {}

  @Get()
  getHello(): string {
    return this.infraServiceService.getHello();
  }
}
