// Log repository - CRUD operations for log entries

import { getDatabase } from '../db/init';
import type { LogEntry } from '@/types/models';

/**
 * Create a new log entry
 */
export async function createLogEntry(logEntry: LogEntry): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO log_entries (
      id, habit_id, completed_at, logged_at, notes
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      logEntry.id,
      logEntry.habitId,
      logEntry.completedAt,
      logEntry.loggedAt,
      logEntry.notes ?? null,
    ]
  );
}

/**
 * Get a log entry by ID
 */
export async function getLogEntryById(id: string): Promise<LogEntry | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    'SELECT * FROM log_entries WHERE id = ?',
    [id]
  );

  if (!result) {
    return null;
  }

  return mapRowToLogEntry(result);
}

/**
 * Get all log entries for a specific habit
 */
export async function getLogEntriesByHabitId(habitId: string): Promise<LogEntry[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<any>(
    'SELECT * FROM log_entries WHERE habit_id = ? ORDER BY completed_at DESC',
    [habitId]
  );

  return results.map(mapRowToLogEntry);
}

/**
 * Get log entries for a habit within a date range
 */
export async function getLogEntriesByDateRange(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<LogEntry[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<any>(
    `SELECT * FROM log_entries
     WHERE habit_id = ?
     AND completed_at >= ?
     AND completed_at <= ?
     ORDER BY completed_at DESC`,
    [habitId, startDate, endDate]
  );

  return results.map(mapRowToLogEntry);
}

/**
 * Get all log entries for a specific date (all habits)
 */
export async function getLogEntriesByDate(date: string): Promise<LogEntry[]> {
  const db = await getDatabase();

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const results = await db.getAllAsync<any>(
    `SELECT * FROM log_entries
     WHERE completed_at >= ?
     AND completed_at <= ?
     ORDER BY completed_at DESC`,
    [startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return results.map(mapRowToLogEntry);
}

/**
 * Check if a habit was completed on a specific date
 */
export async function isHabitCompletedOnDate(
  habitId: string,
  date: string
): Promise<boolean> {
  const db = await getDatabase();

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE habit_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [habitId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return (result?.count ?? 0) > 0;
}

/**
 * Get completion count for a habit on a specific date
 */
export async function getCompletionCountForDate(
  habitId: string,
  date: string
): Promise<number> {
  const db = await getDatabase();

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE habit_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [habitId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return result?.count ?? 0;
}

/**
 * Update a log entry
 */
export async function updateLogEntry(logEntry: LogEntry): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE log_entries SET
      habit_id = ?,
      completed_at = ?,
      logged_at = ?,
      notes = ?
    WHERE id = ?`,
    [
      logEntry.habitId,
      logEntry.completedAt,
      logEntry.loggedAt,
      logEntry.notes ?? null,
      logEntry.id,
    ]
  );
}

/**
 * Delete a log entry
 */
export async function deleteLogEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM log_entries WHERE id = ?', [id]);
}

/**
 * Delete all log entries for a habit
 */
export async function deleteLogEntriesByHabitId(habitId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM log_entries WHERE habit_id = ?', [habitId]);
}

/**
 * Helper function to map database row to LogEntry object
 */
function mapRowToLogEntry(row: any): LogEntry {
  return {
    id: row.id,
    habitId: row.habit_id,
    completedAt: row.completed_at,
    loggedAt: row.logged_at,
    notes: row.notes ?? undefined,
  };
}
