import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsAuthService } from './ws-auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationGateway');

  // Map userId to Socket ID(s)
  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly wsAuthService: WsAuthService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    try {
      const user = this.wsAuthService.getUserFromSocket(client);
      const userId = user.sub; // Matches jwt strategy payload subject

      let sockets = this.userSockets.get(userId);
      if (!sockets) {
        sockets = [];
        this.userSockets.set(userId, sockets);
      }
      sockets.push(client.id);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      // Optionally attach user to socket for later use
      (client.data as Record<string, unknown>).user = user;
    } catch {
      this.logger.error(`Unauthorized connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client.data as { user?: { sub: string } }).user;
    if (user) {
      const userId = user.sub;
      let sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets = sockets.filter((id) => id !== client.id);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  // Push notifications to a specific user
  sendNotificationToUser(
    userId: string,
    eventName: string,
    payload: Record<string, unknown>,
  ) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(eventName, payload);
      });
      return true;
    }
    return false;
  }
}
