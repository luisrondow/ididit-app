// Stats repository - Aggregation queries and statistics

import { getDatabase } from '../db/init';
import type { HeatmapData } from '@/types/models';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

/**
 * Get heatmap data for multiple habits over a date range
 * Used for calendar view (multi-tone heatmap)
 */
export async function getMultiHabitHeatmapData(
  startDate: string,
  endDate: string,
  habitIds?: string[]
): Promise<HeatmapData[]> {
  const db = await getDatabase();

  // Generate all dates in range
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const heatmapData: HeatmapData[] = [];

  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    // Count total active habits for this day
    const totalHabitsQuery = habitIds?.length
      ? `SELECT COUNT(*) as count FROM habits
         WHERE id IN (${habitIds.map(() => '?').join(',')})
         AND is_archived = 0
         AND start_date <= ?
         AND (end_date IS NULL OR end_date >= ?)`
      : `SELECT COUNT(*) as count FROM habits
         WHERE is_archived = 0
         AND start_date <= ?
         AND (end_date IS NULL OR end_date >= ?)`;

    const totalHabitsParams = habitIds?.length
      ? [...habitIds, dayStart, dayEnd]
      : [dayStart, dayEnd];

    const totalResult = await db.getFirstAsync<{ count: number }>(
      totalHabitsQuery,
      totalHabitsParams
    );

    const totalHabits = totalResult?.count ?? 0;

    // Count completions for this day
    const completionsQuery = habitIds?.length
      ? `SELECT COUNT(DISTINCT habit_id) as count FROM log_entries
         WHERE habit_id IN (${habitIds.map(() => '?').join(',')})
         AND completed_at >= ?
         AND completed_at <= ?`
      : `SELECT COUNT(DISTINCT habit_id) as count FROM log_entries
         WHERE completed_at >= ?
         AND completed_at <= ?`;

    const completionsParams = habitIds?.length
      ? [...habitIds, dayStart, dayEnd]
      : [dayStart, dayEnd];

    const completionsResult = await db.getFirstAsync<{ count: number }>(
      completionsQuery,
      completionsParams
    );

    const completionCount = completionsResult?.count ?? 0;

    // Calculate intensity (0-4)
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (totalHabits > 0) {
      const percentage = (completionCount / totalHabits) * 100;
      if (percentage === 0) intensity = 0;
      else if (percentage <= 25) intensity = 1;
      else if (percentage <= 50) intensity = 2;
      else if (percentage <= 75) intensity = 3;
      else intensity = 4;
    }

    heatmapData.push({
      date: dateStr,
      completionCount,
      totalHabits,
      intensity,
    });
  }

  return heatmapData;
}

/**
 * Get heatmap data for a single habit over a date range
 * Used for habit detail view (binary heatmap)
 */
export async function getSingleHabitHeatmapData(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HeatmapData[]> {
  const db = await getDatabase();

  // Generate all dates in range
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const heatmapData: HeatmapData[] = [];

  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    // Check if habit was completed on this day
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM log_entries
       WHERE habit_id = ?
       AND completed_at >= ?
       AND completed_at <= ?`,
      [habitId, dayStart, dayEnd]
    );

    const isCompleted = (result?.count ?? 0) > 0;

    heatmapData.push({
      date: dateStr,
      completionCount: result?.count ?? 0,
      totalHabits: 1,
      intensity: isCompleted ? 4 : 0,
      isCompleted,
    });
  }

  return heatmapData;
}

/**
 * Get completion statistics for a habit over a period
 */
export async function getCompletionStats(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<{ totalCompletions: number; completionRate: number }> {
  const db = await getDatabase();

  const dayStart = startOfDay(new Date(startDate)).toISOString();
  const dayEnd = endOfDay(new Date(endDate)).toISOString();

  // Count total completions
  const completionsResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE habit_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [habitId, dayStart, dayEnd]
  );

  const totalCompletions = completionsResult?.count ?? 0;

  // Calculate total possible days in range
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const totalDays = dates.length;
  const completionRate = totalDays > 0 ? (totalCompletions / totalDays) * 100 : 0;

  return {
    totalCompletions,
    completionRate: Math.min(100, Math.round(completionRate * 10) / 10), // Round to 1 decimal
  };
}

/**
 * Get overall statistics across all habits
 */
export async function getOverallStats(): Promise<{
  totalHabits: number;
  activeHabits: number;
  totalCompletionsToday: number;
  totalCompletionsThisWeek: number;
  totalCompletionsThisMonth: number;
  totalCompletionsAllTime: number;
}> {
  const db = await getDatabase();

  // Total habits
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits'
  );
  const totalHabits = totalResult?.count ?? 0;

  // Active habits
  const now = new Date().toISOString();
  const activeResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habits
     WHERE is_archived = 0
     AND start_date <= ?
     AND (end_date IS NULL OR end_date >= ?)`,
    [now, now]
  );
  const activeHabits = activeResult?.count ?? 0;

  // Completions today
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();
  const todayResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE completed_at >= ? AND completed_at <= ?`,
    [todayStart, todayEnd]
  );
  const totalCompletionsToday = todayResult?.count ?? 0;

  // Completions this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE completed_at >= ?`,
    [startOfDay(weekStart).toISOString()]
  );
  const totalCompletionsThisWeek = weekResult?.count ?? 0;

  // Completions this month
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE completed_at >= ?`,
    [startOfDay(monthStart).toISOString()]
  );
  const totalCompletionsThisMonth = monthResult?.count ?? 0;

  // All time completions
  const allTimeResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM log_entries'
  );
  const totalCompletionsAllTime = allTimeResult?.count ?? 0;

  return {
    totalHabits,
    activeHabits,
    totalCompletionsToday,
    totalCompletionsThisWeek,
    totalCompletionsThisMonth,
    totalCompletionsAllTime,
  };
}
