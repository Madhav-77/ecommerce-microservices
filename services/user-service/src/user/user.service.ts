import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User as UserEntity } from '../entities/user.entity';
import {
  User,
  CreateUserRequest,
  FindUserByIdRequest,
  FindUserByEmailRequest,
  ValidateUserRequest,
  ValidateUserResponse,
} from './interfaces/user-service.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    this.logger.log(`Creating user with email: ${data.email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new RpcException({
        code: 6, // ALREADY_EXISTS
        message: `User with email ${data.email} already exists`,
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user entity
    const user = this.userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    // Return user without password hash
    return this.mapToProtoUser(savedUser);
  }

  async findUserByEmail(data: FindUserByEmailRequest): Promise<User> {
    this.logger.log(`Finding user by email: ${data.email}`);

    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `User with email ${data.email} not found`,
      });
    }

    return this.mapToProtoUser(user);
  }

  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    this.logger.log(`Validating user with email: ${data.email}`);

    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      return {
        valid: false,
      };
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      user: this.mapToProtoUser(user),
    };
  }

  /**
   * Maps TypeORM User entity to proto User message
   * Excludes sensitive data like password hash
   */
  private mapToProtoUser(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
    };
  }
}
