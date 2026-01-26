import { drizzle } from 'drizzle-orm/node-postgres';
import { getDatabaseEnv } from './env';

const { DATABASE_URL } = getDatabaseEnv();

export const db = drizzle(DATABASE_URL);

export type Database = typeof db;
export * from 'drizzle-orm';
