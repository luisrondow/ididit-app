// Habit repository - CRUD operations for habits

import { getDatabase } from '../db/init';
import type { Habit } from '@/types/models';

/**
 * Create a new habit
 */
export async function createHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO habits (
      id, name, description, category, time_range,
      custom_time_range_value, custom_time_range_unit,
      target_frequency, start_date, end_date,
      created_at, updated_at, is_archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.name,
      habit.description ?? null,
      habit.category ?? null,
      habit.timeRange,
      habit.customTimeRange?.value ?? null,
      habit.customTimeRange?.unit ?? null,
      habit.targetFrequency,
      habit.startDate,
      habit.endDate ?? null,
      habit.createdAt,
      habit.updatedAt,
      habit.isArchived ? 1 : 0,
    ]
  );
}

/**
 * Get a habit by ID
 */
export async function getHabitById(id: string): Promise<Habit | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    'SELECT * FROM habits WHERE id = ?',
    [id]
  );

  if (!result) {
    return null;
  }

  return mapRowToHabit(result);
}

/**
 * Get all habits (optionally filter archived)
 */
export async function getAllHabits(includeArchived = false): Promise<Habit[]> {
  const db = await getDatabase();

  const query = includeArchived
    ? 'SELECT * FROM habits ORDER BY created_at DESC'
    : 'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at DESC';

  const results = await db.getAllAsync<any>(query);

  return results.map(mapRowToHabit);
}

/**
 * Get active habits (not archived, within date range)
 */
export async function getActiveHabits(date?: string): Promise<Habit[]> {
  const db = await getDatabase();
  const targetDate = date ?? new Date().toISOString();

  const results = await db.getAllAsync<any>(
    `SELECT * FROM habits
     WHERE is_archived = 0
     AND start_date <= ?
     AND (end_date IS NULL OR end_date >= ?)
     ORDER BY created_at DESC`,
    [targetDate, targetDate]
  );

  return results.map(mapRowToHabit);
}

/**
 * Update a habit
 */
export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE habits SET
      name = ?,
      description = ?,
      category = ?,
      time_range = ?,
      custom_time_range_value = ?,
      custom_time_range_unit = ?,
      target_frequency = ?,
      start_date = ?,
      end_date = ?,
      updated_at = ?,
      is_archived = ?
    WHERE id = ?`,
    [
      habit.name,
      habit.description ?? null,
      habit.category ?? null,
      habit.timeRange,
      habit.customTimeRange?.value ?? null,
      habit.customTimeRange?.unit ?? null,
      habit.targetFrequency,
      habit.startDate,
      habit.endDate ?? null,
      habit.updatedAt,
      habit.isArchived ? 1 : 0,
      habit.id,
    ]
  );
}

/**
 * Delete a habit (and all its log entries via CASCADE)
 */
export async function deleteHabit(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

/**
 * Archive/unarchive a habit
 */
export async function archiveHabit(id: string, isArchived: boolean): Promise<void> {
  const db = await getDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    'UPDATE habits SET is_archived = ?, updated_at = ? WHERE id = ?',
    [isArchived ? 1 : 0, updatedAt, id]
  );
}

/**
 * Helper function to map database row to Habit object
 */
function mapRowToHabit(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    timeRange: row.time_range,
    customTimeRange:
      row.custom_time_range_value && row.custom_time_range_unit
        ? {
            value: row.custom_time_range_value,
            unit: row.custom_time_range_unit,
          }
        : undefined,
    targetFrequency: row.target_frequency,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isArchived: row.is_archived === 1,
  };
}
