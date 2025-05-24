import postgres from 'postgres';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';

let db : ReturnType<typeof drizzle<typeof schema>> | null = null;
export const getDb = () => {
    if (!db) {
        if (!process.env.POSTGRES_URL) {
            throw new Error("POSTGRES_URL not set");
        }
        const client = postgres(process.env.POSTGRES_URL);
        db = drizzle(client, { schema });
    }
    return db;
}