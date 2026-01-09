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
      id, goal_id, completed_at, logged_at, notes
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      logEntry.id,
      logEntry.goalId,
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
 * Get all log entries for a specific goal
 */
export async function getLogEntriesByGoalId(goalId: string): Promise<LogEntry[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<any>(
    'SELECT * FROM log_entries WHERE goal_id = ? ORDER BY completed_at DESC',
    [goalId]
  );

  return results.map(mapRowToLogEntry);
}

/**
 * Get log entries for a goal within a date range
 */
export async function getLogEntriesByDateRange(
  goalId: string,
  startDate: string,
  endDate: string
): Promise<LogEntry[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<any>(
    `SELECT * FROM log_entries
     WHERE goal_id = ?
     AND completed_at >= ?
     AND completed_at <= ?
     ORDER BY completed_at DESC`,
    [goalId, startDate, endDate]
  );

  return results.map(mapRowToLogEntry);
}

/**
 * Get all log entries for a specific date (all goals)
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
 * Check if a goal was completed on a specific date
 */
export async function isGoalCompletedOnDate(
  goalId: string,
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
     WHERE goal_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [goalId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return (result?.count ?? 0) > 0;
}

/**
 * Get completion count for a goal on a specific date
 */
export async function getCompletionCountForDate(
  goalId: string,
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
     WHERE goal_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [goalId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return result?.count ?? 0;
}

/**
 * Get total completion count for a goal (for finite goals)
 */
export async function getTotalCompletionCount(goalId: string): Promise<number> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM log_entries WHERE goal_id = ?',
    [goalId]
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
      goal_id = ?,
      completed_at = ?,
      logged_at = ?,
      notes = ?
    WHERE id = ?`,
    [
      logEntry.goalId,
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
 * Delete all log entries for a goal
 */
export async function deleteLogEntriesByGoalId(goalId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM log_entries WHERE goal_id = ?', [goalId]);
}

/**
 * Extended log entry with goal name for display
 */
export interface LogEntryWithGoal extends LogEntry {
  goalName: string;
}

/**
 * Get all log entries with goal names, ordered by completed_at DESC
 */
export async function getAllLogEntries(): Promise<LogEntryWithGoal[]> {
  const db = await getDatabase();

  const results = await db.getAllAsync<any>(
    `SELECT log_entries.*, habits.name as goal_name
     FROM log_entries
     INNER JOIN habits ON log_entries.goal_id = habits.id
     ORDER BY log_entries.completed_at DESC`
  );

  return results.map(mapRowToLogEntryWithGoal);
}

/**
 * Helper function to map database row to LogEntryWithGoal object
 */
function mapRowToLogEntryWithGoal(row: any): LogEntryWithGoal {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.habit_id, // Support both column names
    completedAt: row.completed_at,
    loggedAt: row.logged_at,
    notes: row.notes ?? undefined,
    goalName: row.goal_name ?? row.habit_name,
  };
}

/**
 * Helper function to map database row to LogEntry object
 */
function mapRowToLogEntry(row: any): LogEntry {
  return {
    id: row.id,
    goalId: row.goal_id ?? row.habit_id, // Support both column names
    completedAt: row.completed_at,
    loggedAt: row.logged_at,
    notes: row.notes ?? undefined,
  };
}

// Legacy aliases for backwards compatibility
export const getLogEntriesByHabitId = getLogEntriesByGoalId;
export const isHabitCompletedOnDate = isGoalCompletedOnDate;
export const deleteLogEntriesByHabitId = deleteLogEntriesByGoalId;
export type LogEntryWithHabit = LogEntryWithGoal;
