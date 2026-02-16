import { ObjectType, Field, ID, InputType, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@ObjectType('OrderStatusUpdate')
export class OrderStatusUpdateType {
  @Field(() => ID)
  order_id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  message: string;

  @Field()
  timestamp: string;
}

export enum ResponseType {
  STATUS_UPDATE = 'STATUS_UPDATE',
  LOCATION = 'LOCATION',
  ETA = 'ETA',
  CONFIRMATION = 'CONFIRMATION',
  ERROR = 'ERROR',
}

@ObjectType('TrackingResponse')
export class TrackingResponseType {
  @Field(() => ID)
  order_id: string;

  @Field(() => String)
  type: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  message: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  eta?: string;

  @Field()
  timestamp: string;
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'The status of an order',
});

registerEnumType(ResponseType, {
  name: 'ResponseType',
  description: 'Type of tracking response',
});

@ObjectType('OrderItem')
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  product_id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType('Order')
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  user_id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  total_amount: number;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field()
  created_at: string;
}

@ObjectType('OrderList')
export class OrderListType {
  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  product_id: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class PlaceOrderInput {
  @Field()
  user_email: string; // Will look up user by email

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}
