import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                port: configService.get<number>('POSTGRES_PORT'),
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                autoLoadEntities: true,
                synchronize: false, // We will use migrations
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }
