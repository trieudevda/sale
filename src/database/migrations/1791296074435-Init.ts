import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1791296074435 implements MigrationInterface {
    name = 'Init1791296074435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(100) NOT NULL, \`module\` varchar(100) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`uq_permissions_code\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`email_verified_at\` datetime NULL, \`phone\` varchar(20) NOT NULL, \`phone_verified_at\` datetime NULL, \`address\` varchar(255) NOT NULL, \`username\` varchar(100) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`auth_version\` int UNSIGNED NOT NULL DEFAULT '0', \`status\` enum ('pending', 'active', 'inactive', 'locked', 'suspended') NOT NULL DEFAULT 'active', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`uq_users_username\` (\`username\`), UNIQUE INDEX \`uq_users_email\` (\`email\`), UNIQUE INDEX \`uq_users_phone\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(50) NOT NULL, \`name\` varchar(100) NOT NULL, \`source\` enum ('system', 'custom') NOT NULL DEFAULT 'custom', UNIQUE INDEX \`uq_roles_code\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles\` (\`user_id\` bigint UNSIGNED NOT NULL, \`role_id\` int UNSIGNED NOT NULL, PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_prices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(15,2) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`inventories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL DEFAULT '0', \`productId\` int NULL, UNIQUE INDEX \`REL_19f6e91bd3b53e47103305f3f8\` (\`productId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_movements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`referenceType\` varchar(255) NULL, \`referenceId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` decimal(15,2) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`supplier\` (\`id\` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchase_orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` varchar(255) NOT NULL, \`supplierId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchase_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`unitCost\` decimal(15,2) NOT NULL, \`purchaseOrderId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\` (\`permission_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_prices\` ADD CONSTRAINT \`FK_08b505f0f33710eb52a6f34ada4\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`inventories\` ADD CONSTRAINT \`FK_19f6e91bd3b53e47103305f3f84\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` ADD CONSTRAINT \`FK_a3acb59db67e977be45e382fc56\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_orders\` ADD CONSTRAINT \`FK_0c3ff892a9f2ed16f59d31cccae\` FOREIGN KEY (\`supplierId\`) REFERENCES \`supplier\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_e7898261babdbcab609c0aead7f\` FOREIGN KEY (\`purchaseOrderId\`) REFERENCES \`purchase_orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_5b31a541ce1fc1f428db518efa4\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_5b31a541ce1fc1f428db518efa4\``);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_e7898261babdbcab609c0aead7f\``);
        await queryRunner.query(`ALTER TABLE \`purchase_orders\` DROP FOREIGN KEY \`FK_0c3ff892a9f2ed16f59d31cccae\``);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` DROP FOREIGN KEY \`FK_a3acb59db67e977be45e382fc56\``);
        await queryRunner.query(`ALTER TABLE \`inventories\` DROP FOREIGN KEY \`FK_19f6e91bd3b53e47103305f3f84\``);
        await queryRunner.query(`ALTER TABLE \`product_prices\` DROP FOREIGN KEY \`FK_08b505f0f33710eb52a6f34ada4\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`purchase_items\``);
        await queryRunner.query(`DROP TABLE \`purchase_orders\``);
        await queryRunner.query(`DROP TABLE \`supplier\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`stock_movements\``);
        await queryRunner.query(`DROP INDEX \`REL_19f6e91bd3b53e47103305f3f8\` ON \`inventories\``);
        await queryRunner.query(`DROP TABLE \`inventories\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_prices\``);
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`uq_roles_code\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`uq_users_phone\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`uq_users_email\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`uq_users_username\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`uq_permissions_code\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
    }

}
