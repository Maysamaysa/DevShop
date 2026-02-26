import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WinstonLoki = require('winston-loki');

export const getWinstonConfig = (appName: string) => {
  return WinstonModule.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `[${timestamp}] [${level}] [${context || appName}]: ${message}`;
          }),
        ),
      }),
      new WinstonLoki({
        host: process.env.LOKI_HOST || 'http://localhost:3100',
        labels: { app: appName },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
      }),
    ],
  });
};

@Module({})
export class AppLoggerModule {}
