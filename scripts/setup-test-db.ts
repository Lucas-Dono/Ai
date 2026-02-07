/**
 * Setup Test Database
 *
 * Creates a test database and runs migrations.
 * Run with: tsx scripts/setup-test-db.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

const TEST_DB_NAME = 'creador_inteligencias_test';
const DB_USER = 'postgres';
const DB_PASSWORD = 'b02483e2d89f4a60a7c85310126d61da';
const DB_HOST = 'localhost';
const DB_PORT = '5432';

async function main() {
  console.log('Setting up test database...\n');

  try {
    // Step 1: Create test database if it doesn't exist
    console.log(`Creating database "${TEST_DB_NAME}"...`);
    try {
      await execAsync(
        `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -c "CREATE DATABASE ${TEST_DB_NAME};"`,
        { env: { ...process.env, PGPASSWORD: DB_PASSWORD } }
      );
      console.log('✓ Test database created successfully\n');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('✓ Test database already exists\n');
      } else {
        throw error;
      }
    }

    // Step 2: Load .env.test
    const envTestPath = path.join(process.cwd(), '.env.test');
    const envTestContent = await fs.readFile(envTestPath, 'utf-8');
    const testDbUrl = envTestContent
      .split('\n')
      .find(line => line.startsWith('DATABASE_URL'))
      ?.split('=')[1]
      .replace(/"/g, '');

    if (!testDbUrl) {
      throw new Error('DATABASE_URL not found in .env.test');
    }

    // Step 3: Run Prisma migrations
    console.log('Running Prisma migrations on test database...');
    await execAsync(`npx prisma migrate deploy`, {
      env: { ...process.env, DATABASE_URL: testDbUrl }
    });
    console.log('✓ Migrations completed successfully\n');

    // Step 4: Generate Prisma client
    console.log('Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✓ Prisma client generated\n');

    console.log('✓ Test database setup complete!');
    console.log(`\nYou can now run tests with: npx vitest run __tests__/api/behaviors/\n`);

  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

main();
