import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { GrpcClientModule } from '../grpc-clients/grpc-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    GrpcClientModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
