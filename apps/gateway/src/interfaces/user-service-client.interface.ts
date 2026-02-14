// User Service gRPC client interface

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface FindUserByEmailRequest {
  email: string;
}

export interface ValidateUserRequest {
  email: string;
  password: string;
}

export interface ValidateUserResponse {
  valid: boolean;
  user?: User;
}

export interface UserServiceClient {
  createUser(data: CreateUserRequest): any;
  findUserByEmail(data: FindUserByEmailRequest): any;
  validateUser(data: ValidateUserRequest): any;
}
