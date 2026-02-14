// User Service gRPC client interface

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface FindUserByEmailRequest {
  email: string;
}

export interface UserServiceClient {
  findUserByEmail(data: FindUserByEmailRequest): any;
}
