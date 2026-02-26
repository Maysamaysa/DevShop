import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalAmount: number;
}
