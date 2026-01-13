import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5437,
  username: "notification_service",
  password: "notification_password",
  database: "notification_db",
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
});
