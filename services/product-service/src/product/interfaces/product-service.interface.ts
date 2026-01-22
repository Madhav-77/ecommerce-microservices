// TypeScript interfaces matching product.proto messages

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
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

export interface UpdateProductRequest {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
}

export interface DeleteProductRequest {
  id: string;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export interface UpdateStockRequest {
  id: string;
  quantity: number; // positive to add, negative to reduce
}

export interface CheckStockRequest {
  id: string;
  required_quantity: number;
}

export interface CheckStockResponse {
  available: boolean;
  current_stock: number;
}

// Service interface for gRPC controller
export interface ProductServiceController {
  createProduct(data: CreateProductRequest): Promise<Product>;
  findAllProducts(data: FindAllProductsRequest): Promise<ProductList>;
  checkStock(data: CheckStockRequest): Promise<CheckStockResponse>;
  updateStock(data: UpdateStockRequest): Promise<Product>;
  findProductById(data: FindProductByIdRequest): Promise<Product>;
}
