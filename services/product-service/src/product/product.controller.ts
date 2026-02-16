import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
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
  BulkCreateProductsResponse,
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

  @GrpcStreamMethod('ProductService', 'BulkCreateProducts')
  bulkCreateProducts(
    data: Observable<CreateProductRequest>,
  ): Observable<BulkCreateProductsResponse> {
    return this.productService.bulkCreateProducts(data);
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
