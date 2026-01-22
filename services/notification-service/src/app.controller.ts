import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    const healthCheck = await this.appService.getHealth();

    // Return 503 if database is down
    if (healthCheck.database.status === 'disconnected') {
      throw new Error('Database connection failed');
    }

    return healthCheck;
  }
}
