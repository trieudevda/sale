import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1791278670215 implements MigrationInterface {
    name = 'InitDatabase1791278670215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`DROP INDEX \`uq_customers_phone\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`is_system\` \`source\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TABLE \`user_roles\` (\`user_id\` bigint UNSIGNED NOT NULL, \`role_id\` int UNSIGNED NOT NULL, PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`permissions\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`auth_version\` int UNSIGNED NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_verified_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone_verified_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone_verified_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`source\``);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`source\` enum ('system', 'custom') NOT NULL DEFAULT 'custom'`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`role_id\` \`role_id\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`permission_id\` \`permission_id\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_users_username\` ON \`users\` (\`username\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_users_email\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_users_phone\` ON \`users\` (\`phone\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\` (\`permission_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`uq_users_phone\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`uq_users_email\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`uq_users_username\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`permission_id\` \`permission_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` CHANGE \`role_id\` \`role_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`source\``);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`source\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone_verified_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone_verified_at\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_a000cca60bcf04454e72769949\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_verified_at\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`auth_version\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`permissions\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`source\` \`is_system\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\` (\`permission_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_customers_phone\` ON \`users\` (\`phone\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
