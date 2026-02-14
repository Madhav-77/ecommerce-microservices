// Product Service gRPC client interface

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductList {
  products: Product[];
  total: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
}

export interface FindProductByIdRequest {
  id: string;
}

export interface FindAllProductsRequest {
  page: number;
  limit: number;
}

export interface UpdateStockRequest {
  id: string;
  quantity: number;
}

export interface CheckStockRequest {
  id: string;
  required_quantity: number;
}

export interface CheckStockResponse {
  available: boolean;
  current_stock: number;
}

export interface ProductServiceClient {
  createProduct(data: CreateProductRequest): any;
  findProductById(data: FindProductByIdRequest): any;
  findAllProducts(data: FindAllProductsRequest): any;
  updateStock(data: UpdateStockRequest): any;
  checkStock(data: CheckStockRequest): any;
}
