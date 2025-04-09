import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { entities } from 'src/entities';
import * as path from 'path';

dotenv.config();
export const migrationFolder = path.join(
  __dirname,
  '../../migrations/**/*.{ts,js}',
);

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: entities,
  migrations: [migrationFolder],
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
});
