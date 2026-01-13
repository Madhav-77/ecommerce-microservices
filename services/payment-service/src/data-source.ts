import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5436,
  username: "payment_service",
  password: "payment_password",
  database: "payment_db",
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
});
