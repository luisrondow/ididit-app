// Database migration utilities for future schema changes

import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Current database version
 * Increment this when adding new migrations
 */
export const CURRENT_DB_VERSION = 1;

/**
 * Get the current database version
 */
export async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return result?.user_version ?? 0;
  } catch (error) {
    console.error('Error getting database version:', error);
    return 0;
  }
}

/**
 * Set the database version
 */
export async function setVersion(db: SQLiteDatabase, version: number): Promise<void> {
  try {
    await db.execAsync(`PRAGMA user_version = ${version}`);
    console.log(`Database version set to ${version}`);
  } catch (error) {
    console.error('Error setting database version:', error);
    throw error;
  }
}

/**
 * Run database migrations
 * Call this after database initialization to upgrade schema if needed
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  console.log(`Current database version: ${currentVersion}`);
  console.log(`Target database version: ${CURRENT_DB_VERSION}`);

  if (currentVersion >= CURRENT_DB_VERSION) {
    console.log('Database is up to date');
    return;
  }

  console.log('Running database migrations...');

  try {
    // Run migrations sequentially
    for (let version = currentVersion + 1; version <= CURRENT_DB_VERSION; version++) {
      console.log(`Migrating to version ${version}...`);
      await runMigration(db, version);
      await setVersion(db, version);
      console.log(`Successfully migrated to version ${version}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Run a specific migration
 */
async function runMigration(db: SQLiteDatabase, version: number): Promise<void> {
  switch (version) {
    case 1:
      // Initial version - tables already created in schema.ts
      // No migration needed
      break;

    // Add future migrations here:
    // case 2:
    //   await db.execAsync('ALTER TABLE habits ADD COLUMN new_field TEXT');
    //   break;

    default:
      console.log(`No migration defined for version ${version}`);
  }
}

/**
 * Backup database (for development/testing)
 * Note: In production, implement proper backup strategy
 */
export async function createBackup(db: SQLiteDatabase): Promise<void> {
  // Future: Implement backup logic
  // Could export to JSON, copy database file, etc.
  console.log('Backup functionality not yet implemented');
}

/**
 * Restore database from backup (for development/testing)
 */
export async function restoreFromBackup(db: SQLiteDatabase): Promise<void> {
  // Future: Implement restore logic
  console.log('Restore functionality not yet implemented');
}
