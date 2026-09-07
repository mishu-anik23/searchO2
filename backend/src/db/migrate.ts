import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { env } from '../config/env';

async function ensureDatabaseExists() {
  const rootClient = new Client({
    host: env.PGHOST,
    port: env.PGPORT,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    const checkDb = await rootClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [env.PGDATABASE]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Database "${env.PGDATABASE}" does not exist. Creating it now...`);
      // CREATE DATABASE cannot run in a transaction block
      await rootClient.query(`CREATE DATABASE "${env.PGDATABASE}"`);
      console.log(`✅ Database "${env.PGDATABASE}" created.`);
    } else {
      console.log(`Database "${env.PGDATABASE}" already exists.`);
    }
  } catch (err: any) {
    console.warn(`Could not verify/create database via root client: ${err.message}. Proceeding to connect directly.`);
  } finally {
    await rootClient.end().catch(() => {});
  }
}

export async function runMigrations() {
  await ensureDatabaseExists();

  const client = new Client({
    connectionString: env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log(`Connected to database "${env.PGDATABASE}" for migrations.`);

    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [file]
      );

      if (alreadyApplied.rowCount === 0) {
        console.log(`Applying migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Applied migration: ${file}`);
        } catch (migError) {
          await client.query('ROLLBACK');
          console.error(`❌ Error applying migration ${file}:`, migError);
          throw migError;
        }
      } else {
        console.log(`Migration already applied: ${file}`);
      }
    }

    console.log('🎉 All migrations successfully verified and up to date.');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
