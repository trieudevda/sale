import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.getOrThrow<string>('DB_PORT')),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: false,
    migrationsTableName: 'migrations',
    // ssl: {
    //   ca: fs.readFileSync(path.join(process.cwd(), 'certs', 'ca.pem')),
    // },
    retryAttempts: 5,
    retryDelay: 3000,
  };
};
// export const databaseConfig = (
//   configService: ConfigService,
// ): TypeOrmModuleOptions => {
//   return {
//     type: 'mysql',
//
//     host: configService.getOrThrow<string>('DB_HOST'),
//     port: Number(configService.getOrThrow<string>('DB_PORT')),
//
//     username: configService.getOrThrow<string>('DB_USERNAME'),
//
//     password: configService.getOrThrow<string>('DB_PASSWORD'),
//
//     database: configService.getOrThrow<string>('DB_DATABASE'),
//
//     autoLoadEntities: true,
//
//     synchronize: false,
//     entities: [__dirname + '/../modules/**/entities/*{.ts,.js}'],
//
//     migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
//
//     migrationsTableName: 'migrations',
//
//     ssl: {
//       ca: fs.readFileSync(path.join(process.cwd(), 'certs', 'ca.pem')),
//     },
//
//     retryAttempts: 5,
//     retryDelay: 3000,
//   };
// };