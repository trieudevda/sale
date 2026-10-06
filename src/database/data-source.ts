import 'dotenv/config';

import { DataSource } from 'typeorm';
import fs from 'fs';
import path from 'path';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env['DB_HOST'],
  port: Number(process.env['DB_PORT']),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_DATABASE'],
  synchronize: false,
  entities: ['src/modules/**/entities/*{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: {
    ca: fs.readFileSync(path.join(process.cwd(), 'certs', 'ca.pem')),
  },
});

export default dataSource;
