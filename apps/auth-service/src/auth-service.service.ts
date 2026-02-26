import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(token: string) {
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshTokenRecord.expiresAt) {
      await this.refreshTokenRepository.remove(refreshTokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token and issue new ones
    refreshTokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(refreshTokenRecord);

    return this.generateTokens(refreshTokenRecord.user);
  }

  async logout(token: string) {
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    if (refreshTokenRecord) {
      refreshTokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(refreshTokenRecord);
    }
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Default to 7 days if not configured
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'default_refresh_secret',
    );
    const expiresInStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );

    // Simplistic expiry parsing, assumes '7d'. Hardcoded logic for simplicity
    const days = parseInt(expiresInStr.replace('d', '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const refreshTokenString = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: expiresInStr as any,
    });

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshTokenString,
      expiresAt: expiresAt,
      user: user,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}
