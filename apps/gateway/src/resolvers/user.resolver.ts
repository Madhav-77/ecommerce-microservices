import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  UserType,
  RegisterUserInput,
  LoginInput,
  LoginResponseType,
} from '../types/user.type';

interface UserServiceClient {
  createUser(data: {
    email: string;
    name: string;
    password: string;
  }): any;
  findUserByEmail(data: { email: string }): any;
  validateUser(data: { email: string; password: string }): any;
}

@Resolver(() => UserType)
export class UserResolver implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@Inject('USER_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  @Mutation(() => UserType, { description: 'Register a new user' })
  async registerUser(
    @Args('input') input: RegisterUserInput,
  ): Promise<UserType> {
    try {
      const user = await lastValueFrom(
        this.userService.createUser({
          email: input.email,
          name: input.name,
          password: input.password,
        }),
      );
      return user as UserType;
    } catch (error) {
      throw new Error(error.details || 'Failed to register user');
    }
  }

  @Query(() => UserType, {
    description: 'Get user by email',
    nullable: true,
  })
  async getUser(@Args('email') email: string): Promise<UserType | null> {
    try {
      const user = await lastValueFrom(
        this.userService.findUserByEmail({ email }),
      );
      return user as UserType;
    } catch (error) {
      // Return null if user not found, throw for other errors
      if (error.code === 5) {
        // NOT_FOUND
        return null;
      }
      throw new Error(error.details || 'Failed to get user');
    }
  }

  @Mutation(() => LoginResponseType, { description: 'Login with credentials' })
  async login(@Args('input') input: LoginInput): Promise<LoginResponseType> {
    try {
      const response = await lastValueFrom(
        this.userService.validateUser({
          email: input.email,
          password: input.password,
        }),
      );
      return response as LoginResponseType;
    } catch (error) {
      throw new Error(error.details || 'Failed to login');
    }
  }
}
