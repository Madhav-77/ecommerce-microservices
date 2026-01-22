import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Product as ProductEntity } from '../entities/product.entity';
import type {
  Product,
  ProductList,
  CreateProductRequest,
  FindProductByIdRequest,
  FindAllProductsRequest,
  UpdateStockRequest,
  CheckStockRequest,
  CheckStockResponse,
} from './interfaces/product-service.interface';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createProduct(data: CreateProductRequest): Promise<Product> {
    this.logger.log(`Creating product: ${data.name}`);

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'Product name is required',
      });
    }

    // Validate price and stock
    if (data.price == null || data.price <= 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'Price must be greater than 0',
      });
    }

    if (data.stock == null || data.stock < 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'Stock cannot be negative',
      });
    }

    // Create product entity
    const product = this.productRepository.create({
      name: data.name,
      price: data.price,
      stock: data.stock,
    });

    // Save to database
    const savedProduct = await this.productRepository.save(product);

    return this.mapToProtoProduct(savedProduct);
  }

  async findProductById(data: FindProductByIdRequest): Promise<Product> {
    this.logger.log(`Finding product by ID: ${data.id}`);

    const product = await this.productRepository.findOne({
      where: { id: data.id },
    });

    if (!product) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Product with ID ${data.id} not found`,
      });
    }

    return this.mapToProtoProduct(product);
  }

  async findAllProducts(data: FindAllProductsRequest): Promise<ProductList> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    this.logger.log(`Finding products - page: ${page}, limit: ${limit}`);

    // Validate pagination params
    if (page < 1 || limit < 1) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'Page and limit must be greater than 0',
      });
    }

    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      products: products.map((p) => this.mapToProtoProduct(p)),
      total,
    };
  }

  async updateStock(data: UpdateStockRequest): Promise<Product> {
    this.logger.log(
      `Updating stock for product ${data.id} by ${data.quantity}`,
    );

    const product = await this.productRepository.findOne({
      where: { id: data.id },
    });

    if (!product) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Product with ID ${data.id} not found`,
      });
    }

    const newStock = product.stock + data.quantity;

    // Prevent negative stock
    if (newStock < 0) {
      throw new RpcException({
        code: 9, // FAILED_PRECONDITION
        message: `Insufficient stock. Current: ${product.stock}, Requested: ${Math.abs(data.quantity)}`,
      });
    }

    // Update stock atomically
    product.stock = newStock;
    const updatedProduct = await this.productRepository.save(product);

    return this.mapToProtoProduct(updatedProduct);
  }

  async checkStock(data: CheckStockRequest): Promise<CheckStockResponse> {
    this.logger.log(
      `Checking stock for product ${data.id}, required: ${data.required_quantity}`,
    );

    const product = await this.productRepository.findOne({
      where: { id: data.id },
    });

    if (!product) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Product with ID ${data.id} not found`,
      });
    }

    return {
      available: product.stock >= data.required_quantity,
      current_stock: product.stock,
    };
  }

  /**
   * Maps TypeORM Product entity to proto Product message
   */
  private mapToProtoProduct(product: ProductEntity): Product {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price), // Convert decimal to number
      stock: product.stock,
      created_at: product.createdAt.toISOString(),
    };
  }
}
