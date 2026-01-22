import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ProductService');

  // Create hybrid application (HTTP + gRPC)
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks for graceful DB disconnect
  app.enableShutdownHooks();

  // Configure gRPC microservice
  const grpcPort = process.env.GRPC_PORT ?? 5002;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: join(__dirname, '../../../../libs/proto/src/product.proto'),
      url: `0.0.0.0:${grpcPort}`,
      loader: {
        keepCase: true, // Preserve snake_case field names from proto
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Start all microservices
  await app.startAllMicroservices();
  logger.log(`gRPC server running on 0.0.0.0:${grpcPort}`);

  // Start HTTP server for health checks
  const httpPort = process.env.PORT ?? 3002;
  await app.listen(httpPort);
  logger.log(`HTTP server running on http://localhost:${httpPort}`);
  logger.log(`Health check: http://localhost:${httpPort}/health`);
}
bootstrap();
