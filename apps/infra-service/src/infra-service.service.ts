import { Injectable } from '@nestjs/common';

@Injectable()
export class InfraServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
