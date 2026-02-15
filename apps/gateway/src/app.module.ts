import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloResolver } from './hello.resolver';
import { GrpcClientModule } from './grpc-clients/grpc-client.module';
import { UserResolver } from './resolvers/user.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { OrderResolver } from './resolvers/order.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      csrfPrevention: false, // Disabled for development
      subscriptions: {
        'graphql-ws': true, // Enable WebSocket subscriptions
      },
    }),
    GrpcClientModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelloResolver, UserResolver, ProductResolver, OrderResolver],
})
export class AppModule {}
