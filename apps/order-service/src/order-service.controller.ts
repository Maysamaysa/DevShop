import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from './order-service.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/common';
import { OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  create(
    @Request() req: { user: { userId: string } },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // req.user is populated by JwtAuthGuard with { userId, email, role }
    const userId = req.user.userId;
    return this.orderService.create(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of orders' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    description: 'ISO date string',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    description: 'ISO date string',
  })
  @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, default: 10 })
  findAll(@Query() queryDto: QueryOrdersDto) {
    return this.orderService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @Roles('admin') // Can optionally restrict soft-delete to admins
  @ApiOperation({ summary: 'Soft delete an order' })
  softDelete(@Param('id') id: string) {
    return this.orderService.softDelete(id);
  }
}
