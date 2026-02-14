import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('OrderService');

  // Create hybrid application (HTTP + gRPC)
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks for graceful DB disconnect
  app.enableShutdownHooks();

  // Configure gRPC microservice
  const grpcPort = process.env.GRPC_PORT ?? 5003;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: join(__dirname, '../../../../libs/proto/src/order.proto'),
      url: `0.0.0.0:${grpcPort}`,
      loader: {
        keepCase: true,
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
  const httpPort = process.env.PORT ?? 3003;
  await app.listen(httpPort);
  logger.log(`HTTP server running on http://localhost:${httpPort}`);
  logger.log(`Health check: http://localhost:${httpPort}/health`);
}
bootstrap();
