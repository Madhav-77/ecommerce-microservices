import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  // Enable CORS for client access
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  logger.log(`API Gateway running on http://localhost:${port}`);
  logger.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Apollo Sandbox available at the GraphQL endpoint`);
}
bootstrap();
