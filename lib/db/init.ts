// Database initialization and management

import * as SQLite from 'expo-sqlite';
import { CREATE_HABITS_TABLE, CREATE_LOG_ENTRIES_TABLE, CREATE_INDEXES } from './schema';

const DB_NAME = 'ididit.db';

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (database) {
      return database;
    }

    database = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await database.execAsync(CREATE_HABITS_TABLE);
    await database.execAsync(CREATE_LOG_ENTRIES_TABLE);
    await database.execAsync(CREATE_INDEXES);

    console.log('Database initialized successfully');
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get the database instance (initializes if needed)
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }
  return initDatabase();
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
    console.log('Database closed');
  }
}

/**
 * Reset the database (FOR DEVELOPMENT ONLY)
 * Drops all tables and recreates them
 */
export async function resetDatabase(): Promise<void> {
  try {
    const db = await getDatabase();

    // Drop tables
    await db.execAsync('DROP TABLE IF EXISTS log_entries;');
    await db.execAsync('DROP TABLE IF EXISTS habits;');

    // Recreate tables
    await db.execAsync(CREATE_HABITS_TABLE);
    await db.execAsync(CREATE_LOG_ENTRIES_TABLE);
    await db.execAsync(CREATE_INDEXES);

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}
