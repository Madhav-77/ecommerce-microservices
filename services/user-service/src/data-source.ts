import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "user_service",
  password: "user_password",
  database: "user_db",
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
});
