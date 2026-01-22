import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import type {
  User,
  CreateUserRequest,
  FindUserByIdRequest,
  FindUserByEmailRequest,
  ValidateUserRequest,
  ValidateUserResponse,
  UserServiceController,
} from './interfaces/user-service.interface';

@Controller()
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<User> {
    return this.userService.createUser(data);
  }

  @GrpcMethod('UserService', 'FindUserByEmail')
  async findUserByEmail(data: FindUserByEmailRequest): Promise<User> {
    return this.userService.findUserByEmail(data);
  }

  @GrpcMethod('UserService', 'ValidateUser')
  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    return this.userService.validateUser(data);
  }

  // TODO: Implement UpdateUser and DeleteUser in future phases
  // @GrpcMethod('UserService', 'UpdateUser')
  // async updateUser(data: UpdateUserRequest): Promise<User> {
  //   return this.userService.updateUser(data);
  // }

  // @GrpcMethod('UserService', 'DeleteUser')
  // async deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse> {
  //   return this.userService.deleteUser(data);
  // }
}
