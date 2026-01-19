import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HelloResolver {
  @Query(() => String, { description: 'Test query to verify GraphQL is working' })
  hello(): string {
    return 'Hello from API Gateway! GraphQL is working correctly.';
  }

  @Query(() => String, { description: 'Returns gateway status and connection info' })
  status(): string {
    return 'API Gateway is running on port 4000. Ready to connect to microservices via gRPC.';
  }
}
