// Database migration utilities for future schema changes

import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Current database version
 * Increment this when adding new migrations
 */
export const CURRENT_DB_VERSION = 2;

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

    case 2:
      // Add goal_type column and rename target_frequency to target_count
      // Also rename habit_id to goal_id in log_entries
      await migrateToV2(db);
      break;

    default:
      console.log(`No migration defined for version ${version}`);
  }
}

/**
 * Migration to version 2: Add goal tracking support
 * - Add goal_type column with default 'recurring'
 * - Rename target_frequency to target_count
 * - Rename habit_id to goal_id in log_entries
 */
async function migrateToV2(db: SQLiteDatabase): Promise<void> {
  // Check if goal_type column already exists
  const tableInfo = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(habits)"
  );
  const columns = tableInfo.map(col => col.name);

  // Add goal_type column if it doesn't exist
  if (!columns.includes('goal_type')) {
    await db.execAsync(
      "ALTER TABLE habits ADD COLUMN goal_type TEXT NOT NULL DEFAULT 'recurring' CHECK(goal_type IN ('recurring', 'finite'))"
    );
    console.log('Added goal_type column');
  }

  // SQLite doesn't support renaming columns directly in older versions
  // We need to check if target_count exists, if not, we need to handle migration
  if (columns.includes('target_frequency') && !columns.includes('target_count')) {
    // Create new table with correct schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits_new (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        goal_type TEXT NOT NULL DEFAULT 'recurring' CHECK(goal_type IN ('recurring', 'finite')),
        time_range TEXT NOT NULL CHECK(time_range IN ('daily', 'weekly', 'monthly', 'custom')),
        custom_time_range_value INTEGER,
        custom_time_range_unit TEXT CHECK(custom_time_range_unit IN ('days', 'weeks', 'months')),
        target_count INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_archived INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Copy data from old table to new table
    await db.execAsync(`
      INSERT INTO habits_new (
        id, name, description, category, goal_type, time_range,
        custom_time_range_value, custom_time_range_unit, target_count,
        start_date, end_date, created_at, updated_at, is_archived
      )
      SELECT 
        id, name, description, category, 'recurring', time_range,
        custom_time_range_value, custom_time_range_unit, target_frequency,
        start_date, end_date, created_at, updated_at, is_archived
      FROM habits
    `);

    // Drop old table and rename new table
    await db.execAsync('DROP TABLE habits');
    await db.execAsync('ALTER TABLE habits_new RENAME TO habits');
    console.log('Renamed target_frequency to target_count');
  }

  // Handle log_entries migration (habit_id -> goal_id)
  const logTableInfo = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(log_entries)"
  );
  const logColumns = logTableInfo.map(col => col.name);

  if (logColumns.includes('habit_id') && !logColumns.includes('goal_id')) {
    // Create new table with correct schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS log_entries_new (
        id TEXT PRIMARY KEY NOT NULL,
        goal_id TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        logged_at TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (goal_id) REFERENCES habits(id) ON DELETE CASCADE
      )
    `);

    // Copy data from old table to new table
    await db.execAsync(`
      INSERT INTO log_entries_new (id, goal_id, completed_at, logged_at, notes)
      SELECT id, habit_id, completed_at, logged_at, notes
      FROM log_entries
    `);

    // Drop old table and rename new table
    await db.execAsync('DROP TABLE log_entries');
    await db.execAsync('ALTER TABLE log_entries_new RENAME TO log_entries');
    console.log('Renamed habit_id to goal_id in log_entries');
  }

  // Create new index for goal_type
  await db.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_habits_goal_type ON habits(goal_type)'
  );

  // Recreate indexes with new column names
  await db.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_log_entries_goal_id ON log_entries(goal_id)'
  );
  await db.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_log_entries_goal_completed ON log_entries(goal_id, completed_at)'
  );

  console.log('Migration to v2 completed');
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
