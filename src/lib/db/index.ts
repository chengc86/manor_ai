import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to ensure DATABASE_URL is available at runtime
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    console.log('=== DB INITIALIZATION ===');
    const connectionString = process.env.DATABASE_URL;
    console.log('DATABASE_URL exists:', !!connectionString);
    console.log('DATABASE_URL starts with:', connectionString?.substring(0, 30));

    if (!connectionString) {
      console.error('DATABASE_URL is not set!');
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Creating postgres client...');
    const client = postgres(connectionString);
    console.log('Creating drizzle instance...');
    _db = drizzle(client, { schema });
    console.log('DB initialized successfully');
  }
  return _db;
}

// Export a proxy that lazily initializes the db
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export * from './schema';
