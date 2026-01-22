import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentsTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for payment status
    await queryRunner.query(`
      CREATE TYPE payment_status_enum AS ENUM ('SUCCESS', 'FAILED')
    `);

    await queryRunner.createTable(
      new Table({
        name: "payments",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "order_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "status",
            type: "payment_status_enum",
            isNullable: false,
          },
          {
            name: "provider",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payments");
    await queryRunner.query(`DROP TYPE payment_status_enum`);
  }
}
