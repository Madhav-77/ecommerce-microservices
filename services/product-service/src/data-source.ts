import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5434,
  username: "product_service",
  password: "product_password",
  database: "product_db",
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
});
