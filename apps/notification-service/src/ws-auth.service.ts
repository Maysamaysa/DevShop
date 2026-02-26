import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  getUserFromSocket(client: Socket): {
    sub: string;
    email: string;
    role: string;
  } {
    let authHeader = client.handshake.headers.authorization;

    // Also support passing token in connection query payload
    if (!authHeader && (client.handshake.auth as { token?: string })?.token) {
      authHeader = (client.handshake.auth as { token: string }).token;
    }

    if (!authHeader) {
      throw new WsException('Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'default_secret_key',
      );
      const payload: { sub: string; email: string; role: string } =
        this.jwtService.verify(token, { secret });
      return payload; // { sub: userId, email, role }
    } catch {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
