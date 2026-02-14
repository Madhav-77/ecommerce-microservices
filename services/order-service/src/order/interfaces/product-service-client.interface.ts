// Product Service gRPC client interface

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface FindProductByIdRequest {
  id: string;
}

export interface CheckStockRequest {
  id: string;
  required_quantity: number;
}

export interface CheckStockResponse {
  available: boolean;
  current_stock: number;
}

export interface UpdateStockRequest {
  id: string;
  quantity: number;
}

export interface ProductServiceClient {
  findProductById(data: FindProductByIdRequest): any;
  checkStock(data: CheckStockRequest): any;
  updateStock(data: UpdateStockRequest): any;
}
