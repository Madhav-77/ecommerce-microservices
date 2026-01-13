import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5435,
  username: "order_service",
  password: "order_password",
  database: "order_db",
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
});
