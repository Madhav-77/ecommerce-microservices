import { GraphQLClient } from 'graphql-request';

// Gateway GraphQL endpoint (configurable via environment variable)
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000/graphql';

// WebSocket endpoint for subscriptions
export const WS_GATEWAY_URL = import.meta.env.VITE_WS_GATEWAY_URL || 'ws://localhost:4000/graphql';

// Create and export GraphQL client instance
export const graphqlClient = new GraphQLClient(GATEWAY_URL, {
  credentials: 'include',
});
