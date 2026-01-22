import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks for graceful DB disconnect
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3005;
  await app.listen(port);

  logger.log(`Notification Service running on http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
}
bootstrap();
