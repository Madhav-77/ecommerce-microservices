import { GraphQLClient } from 'graphql-request';

// Gateway GraphQL endpoint
const GATEWAY_URL = 'http://localhost:4000/graphql';

// Create and export GraphQL client instance
export const graphqlClient = new GraphQLClient(GATEWAY_URL, {
  credentials: 'include',
});
