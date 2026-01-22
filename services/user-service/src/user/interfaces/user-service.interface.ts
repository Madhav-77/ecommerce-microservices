// TypeScript interfaces matching user.proto messages

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

export interface FindUserByIdRequest {
  id: string;
}

export interface FindUserByEmailRequest {
  email: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  name?: string;
  password?: string;
}

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ValidateUserRequest {
  email: string;
  password: string;
}

export interface ValidateUserResponse {
  valid: boolean;
  user?: User;
}

// Service interface for gRPC controller
export interface UserServiceController {
  createUser(data: CreateUserRequest): Promise<User>;
  findUserByEmail(data: FindUserByEmailRequest): Promise<User>;
  // updateUser(data: UpdateUserRequest): Promise<User>;
  // deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse>;
  validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse>;
}
