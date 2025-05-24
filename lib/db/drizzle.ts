import postgres from 'postgres';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';

if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL not set");
}
const client = postgres(process.env.POSTGRES_URL);
export const db = drizzle(client, { schema });