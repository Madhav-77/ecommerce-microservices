import { ObjectType, Field, ID, InputType, Int, Float } from '@nestjs/graphql';

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  created_at: string;
}

@ObjectType('ProductList')
export class ProductListType {
  @Field(() => [ProductType])
  products: ProductType[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;
}

@InputType()
export class CheckStockInput {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  required_quantity: number;
}

@ObjectType('CheckStockResponse')
export class CheckStockResponseType {
  @Field()
  available: boolean;

  @Field(() => Int)
  current_stock: number;
}
