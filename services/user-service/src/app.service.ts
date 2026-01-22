import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const timestamp = new Date().toISOString();

    try {
      // Check database connectivity
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        service: 'user-service',
        timestamp,
        database: {
          status: 'connected',
          type: 'postgres',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'user-service',
        timestamp,
        database: {
          status: 'disconnected',
          error: error.message,
        },
      };
    }
  }
}
