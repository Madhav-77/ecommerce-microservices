import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import {
  ProductType,
  ProductListType,
  CreateProductInput,
  CheckStockInput,
  CheckStockResponseType,
  BulkCreateProductsResponseType,
} from '../types/product.type';
import type { ProductServiceClient } from '../interfaces/product-service-client.interface';

@Resolver(() => ProductType)
export class ProductResolver implements OnModuleInit {
  private readonly logger = new Logger(ProductResolver.name);
  private productService: ProductServiceClient;

  constructor(@Inject('PRODUCT_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.productService =
      this.client.getService<ProductServiceClient>('ProductService');
  }

  @Query(() => ProductListType, { description: 'Get all products with pagination' })
  async getProducts(
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
  ): Promise<ProductListType> {
    try {
      const result = await lastValueFrom(
        this.productService.findAllProducts({ page, limit }),
      );
      return result as ProductListType;
    } catch (error) {
      throw new Error(error.details || 'Failed to get products');
    }
  }

  @Query(() => ProductType, {
    description: 'Get product by ID',
    nullable: true,
  })
  async getProduct(@Args('id') id: string): Promise<ProductType | null> {
    try {
      const product = await lastValueFrom(
        this.productService.findProductById({ id }),
      );
      return product as ProductType;
    } catch (error) {
      // Return null if product not found
      if (error.code === 5) {
        // NOT_FOUND
        return null;
      }
      throw new Error(error.details || 'Failed to get product');
    }
  }

  @Mutation(() => ProductType, { description: 'Create a new product' })
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductType> {
    try {
      const product = await lastValueFrom(
        this.productService.createProduct({
          name: input.name,
          price: input.price,
          stock: input.stock,
        }),
      );
      return product as ProductType;
    } catch (error) {
      throw new Error(error.details || 'Failed to create product');
    }
  }

  @Query(() => CheckStockResponseType, { description: 'Check product stock availability' })
  async checkStock(
    @Args('input') input: CheckStockInput,
  ): Promise<CheckStockResponseType> {
    try {
      const result = await lastValueFrom(
        this.productService.checkStock({
          id: input.id,
          required_quantity: input.required_quantity,
        }),
      );
      return result as CheckStockResponseType;
    } catch (error) {
      throw new Error(error.details || 'Failed to check stock');
    }
  }

  @Mutation(() => BulkCreateProductsResponseType, {
    description: 'Bulk create products (Client Streaming RPC)',
  })
  async bulkCreateProducts(
    @Args('products', { type: () => [CreateProductInput] })
    products: CreateProductInput[],
  ): Promise<BulkCreateProductsResponseType> {
    this.logger.log(`📤 [GATEWAY] Starting bulk upload: ${products.length} products`);

    try {
      // Convert array to Observable stream for gRPC client streaming
      const productStream: Observable<any> = from(products).pipe(
        concatMap((product, index) => {
          const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
          this.logger.log(`⬆️  [${timestamp}] Streaming to Product Service [${index + 1}/${products.length}]: ${product.name}`);
          return [product]; // Emit each product one at a time
        }),
      );

      this.logger.log('🔄 [GATEWAY] Calling gRPC client streaming method...');

      // Call gRPC client streaming method
      const result = await lastValueFrom(
        this.productService.bulkCreateProducts(productStream),
      );

      this.logger.log(
        `✅ [GATEWAY] Bulk create complete: ${result.created} created, ${result.failed} failed`,
      );

      return result as BulkCreateProductsResponseType;
    } catch (error) {
      this.logger.error('❌ [GATEWAY] Bulk create failed:', error);
      throw new Error(error.details || 'Failed to bulk create products');
    }
  }
}
