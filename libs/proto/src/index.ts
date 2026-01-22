// Re-export all proto paths for easy import
export const PROTO_PATHS = {
  USER: __dirname + '/user.proto',
  PRODUCT: __dirname + '/product.proto',
  ORDER: __dirname + '/order.proto',
  PAYMENT: __dirname + '/payment.proto',
  NOTIFICATION: __dirname + '/notification.proto',
};

export const PROTO_PACKAGES = {
  USER: 'user',
  PRODUCT: 'product',
  ORDER: 'order',
  PAYMENT: 'payment',
  NOTIFICATION: 'notification',
};

export const GRPC_PORTS = {
  USER: process.env.USER_GRPC_PORT || 5001,
  PRODUCT: process.env.PRODUCT_GRPC_PORT || 5002,
  ORDER: process.env.ORDER_GRPC_PORT || 5003,
  PAYMENT: process.env.PAYMENT_GRPC_PORT || 5004,
  NOTIFICATION: process.env.NOTIFICATION_GRPC_PORT || 5005,
};

export const GRPC_URLS = {
  USER: `localhost:${GRPC_PORTS.USER}`,
  PRODUCT: `localhost:${GRPC_PORTS.PRODUCT}`,
  ORDER: `localhost:${GRPC_PORTS.ORDER}`,
  PAYMENT: `localhost:${GRPC_PORTS.PAYMENT}`,
  NOTIFICATION: `localhost:${GRPC_PORTS.NOTIFICATION}`,
};
