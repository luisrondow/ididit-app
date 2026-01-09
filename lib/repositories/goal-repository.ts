// Goal repository - CRUD operations for goals

import { getDatabase } from '../db/init';
import type { Goal } from '@/types/models';

/**
 * Create a new goal
 */
export async function createGoal(goal: Goal): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO habits (
      id, name, description, category, goal_type, time_range,
      custom_time_range_value, custom_time_range_unit,
      target_count, start_date, end_date,
      created_at, updated_at, is_archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      goal.id,
      goal.name,
      goal.description ?? null,
      goal.category ?? null,
      goal.goalType,
      goal.timeRange,
      goal.customTimeRange?.value ?? null,
      goal.customTimeRange?.unit ?? null,
      goal.targetCount,
      goal.startDate,
      goal.endDate ?? null,
      goal.createdAt,
      goal.updatedAt,
      goal.isArchived ? 1 : 0,
    ]
  );
}

/**
 * Get a goal by ID
 */
export async function getGoalById(id: string): Promise<Goal | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    'SELECT * FROM habits WHERE id = ?',
    [id]
  );

  if (!result) {
    return null;
  }

  return mapRowToGoal(result);
}

/**
 * Get all goals (optionally filter archived)
 */
export async function getAllGoals(includeArchived = false): Promise<Goal[]> {
  const db = await getDatabase();

  const query = includeArchived
    ? 'SELECT * FROM habits ORDER BY created_at DESC'
    : 'SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at DESC';

  const results = await db.getAllAsync<any>(query);

  return results.map(mapRowToGoal);
}

/**
 * Get active goals (not archived, within date range)
 */
export async function getActiveGoals(date?: string): Promise<Goal[]> {
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

  return results.map(mapRowToGoal);
}

/**
 * Get goals by type
 */
export async function getGoalsByType(
  goalType: 'recurring' | 'finite',
  includeArchived = false
): Promise<Goal[]> {
  const db = await getDatabase();

  const query = includeArchived
    ? 'SELECT * FROM habits WHERE goal_type = ? ORDER BY created_at DESC'
    : 'SELECT * FROM habits WHERE goal_type = ? AND is_archived = 0 ORDER BY created_at DESC';

  const results = await db.getAllAsync<any>(query, [goalType]);

  return results.map(mapRowToGoal);
}

/**
 * Update a goal
 */
export async function updateGoal(goal: Goal): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE habits SET
      name = ?,
      description = ?,
      category = ?,
      goal_type = ?,
      time_range = ?,
      custom_time_range_value = ?,
      custom_time_range_unit = ?,
      target_count = ?,
      start_date = ?,
      end_date = ?,
      updated_at = ?,
      is_archived = ?
    WHERE id = ?`,
    [
      goal.name,
      goal.description ?? null,
      goal.category ?? null,
      goal.goalType,
      goal.timeRange,
      goal.customTimeRange?.value ?? null,
      goal.customTimeRange?.unit ?? null,
      goal.targetCount,
      goal.startDate,
      goal.endDate ?? null,
      goal.updatedAt,
      goal.isArchived ? 1 : 0,
      goal.id,
    ]
  );
}

/**
 * Delete a goal (and all its log entries via CASCADE)
 */
export async function deleteGoal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

/**
 * Archive/unarchive a goal
 */
export async function archiveGoal(id: string, isArchived: boolean): Promise<void> {
  const db = await getDatabase();
  const updatedAt = new Date().toISOString();

  await db.runAsync(
    'UPDATE habits SET is_archived = ?, updated_at = ? WHERE id = ?',
    [isArchived ? 1 : 0, updatedAt, id]
  );
}

/**
 * Helper function to map database row to Goal object
 */
function mapRowToGoal(row: any): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    goalType: row.goal_type ?? 'recurring', // Default to recurring for backwards compatibility
    timeRange: row.time_range,
    customTimeRange:
      row.custom_time_range_value && row.custom_time_range_unit
        ? {
            value: row.custom_time_range_value,
            unit: row.custom_time_range_unit,
          }
        : undefined,
    targetCount: row.target_count ?? row.target_frequency ?? 1, // Support both column names for migration
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isArchived: row.is_archived === 1,
  };
}

// Legacy exports for backwards compatibility
export const createHabit = createGoal;
export const getHabitById = getGoalById;
export const getAllHabits = getAllGoals;
export const getActiveHabits = getActiveGoals;
export const updateHabit = updateGoal;
export const deleteHabit = deleteGoal;
export const archiveHabit = archiveGoal;

