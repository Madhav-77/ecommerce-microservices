import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  created_at: string;
}

@InputType()
export class RegisterUserInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType('LoginResponse')
export class LoginResponseType {
  @Field()
  valid: boolean;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}
