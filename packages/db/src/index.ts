import dotenv from 'dotenv';

dotenv.config({
  path: '../../apps/server/.env',
});

import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL || '');

export type Database = typeof db;
export * from 'drizzle-orm';
