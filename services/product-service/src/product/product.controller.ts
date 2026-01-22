import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';
import type {
  Product,
  ProductList,
  CreateProductRequest,
  FindProductByIdRequest,
  FindAllProductsRequest,
  UpdateStockRequest,
  CheckStockRequest,
  CheckStockResponse,
  ProductServiceController,
} from './interfaces/product-service.interface';

@Controller()
export class ProductController implements ProductServiceController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductService', 'CreateProduct')
  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.productService.createProduct(data);
  }

  @GrpcMethod('ProductService', 'FindProductById')
  async findProductById(data: FindProductByIdRequest): Promise<Product> {
    return this.productService.findProductById(data);
  }

  @GrpcMethod('ProductService', 'FindAllProducts')
  async findAllProducts(data: FindAllProductsRequest): Promise<ProductList> {
    return this.productService.findAllProducts(data);
  }

  @GrpcMethod('ProductService', 'UpdateStock')
  async updateStock(data: UpdateStockRequest): Promise<Product> {
    return this.productService.updateStock(data);
  }

  @GrpcMethod('ProductService', 'CheckStock')
  async checkStock(data: CheckStockRequest): Promise<CheckStockResponse> {
    return this.productService.checkStock(data);
  }

  // TODO: Implement UpdateProduct and DeleteProduct in future phases
  // @GrpcMethod('ProductService', 'UpdateProduct')
  // async updateProduct(data: UpdateProductRequest): Promise<Product> {
  //   return this.productService.updateProduct(data);
  // }

  // @GrpcMethod('ProductService', 'DeleteProduct')
  // async deleteProduct(data: DeleteProductRequest): Promise<DeleteProductResponse> {
  //   return this.productService.deleteProduct(data);
  // }
}
