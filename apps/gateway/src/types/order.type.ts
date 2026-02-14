import { ObjectType, Field, ID, InputType, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'The status of an order',
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
