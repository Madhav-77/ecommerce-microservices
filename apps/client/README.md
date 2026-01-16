# E-Commerce Client

Simple React client for the e-commerce microservices project.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **GraphQL** - API queries (via gateway)

## Getting Started

### Install Dependencies
```bash
cd apps/client
npm install
```

### Run Development Server
```bash
npm run dev
```

Client runs on: http://localhost:3000

### Build for Production
```bash
npm run build
npm run preview
```

## Architecture

```
Client (React)
    ↓ HTTP
Vite Dev Server (localhost:3000)
    ↓ Proxy /graphql → localhost:4000
API Gateway (GraphQL)
    ↓ gRPC
Microservices
```

## Features

### Products View
- Fetch all products
- Display product catalog with prices and stock

### Users View
- Create new users
- Fetch all users
- Simple form for user registration

### Orders View
- Fetch all orders
- Display order history with status

## GraphQL Queries

### Fetch Products
```graphql
query {
  products {
    id
    name
    price
    stock
  }
}
```

### Create User
```graphql
mutation CreateUser($name: String!, $email: String!, $password: String!) {
  createUser(name: $name, email: $email, password: $password) {
    id
    name
    email
  }
}
```

### Fetch Orders
```graphql
query {
  orders {
    id
    userId
    status
    totalAmount
    createdAt
  }
}
```

## Configuration

### Vite Proxy
The Vite dev server proxies GraphQL requests to the gateway:

```typescript
// vite.config.ts
proxy: {
  '/graphql': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
}
```

This allows the client to call `/graphql` which forwards to `localhost:4000/graphql` (the gateway).

## File Structure

```
apps/client/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Products.tsx
│   │   ├── Users.tsx
│   │   └── Orders.tsx
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Next Steps

1. **Start Gateway** - Create and run the GraphQL gateway on port 4000
2. **Start Microservices** - Run all backend services
3. **Test Integration** - Use the client to test end-to-end flow

## Development Workflow

```bash
# Terminal 1: Start databases
docker-compose up -d user-db product-db order-db payment-db notification-db

# Terminal 2: Start microservices (when configured)
cd services/user-service && npm run start:dev

# Terminal 3: Start gateway (when created)
cd apps/gateway && npm run start:dev

# Terminal 4: Start client
cd apps/client && npm run dev
```

## Troubleshooting

### GraphQL errors
- Ensure gateway is running on port 4000
- Check browser console for network errors
- Verify GraphQL schema matches queries

### Proxy not working
- Check vite.config.ts proxy settings
- Restart Vite dev server
- Ensure gateway is accessible at localhost:4000
