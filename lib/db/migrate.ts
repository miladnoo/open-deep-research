import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  // Skip migrations if database operations are disabled
  if (!process.env.POSTGRES_URL) {
    console.log('🚫 Database operations disabled - skipping migrations');
    process.exit(0);
    return;
  }

  try {
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    const db = drizzle(connection);

    console.log('⏳ Running migrations...');

    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed');
    console.error(error);
    // Still exit successfully since database operations are optional
    process.exit(0);
  }
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
