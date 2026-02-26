import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification-service.service';
import { JwtAuthGuard } from '@app/common';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications returned successfully.',
  })
  getUserNotifications(@Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.notificationService.getUserNotifications(userId);
  }
}
