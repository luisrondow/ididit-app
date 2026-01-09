// Stats repository - Aggregation queries and statistics

import { getDatabase } from '../db/init';
import type { HeatmapData } from '@/types/models';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

interface DayCompletionData {
  date_str: string;
  completion_count: number;
}

interface DayGoalsData {
  date_str: string;
  goal_count: number;
}

/**
 * Get heatmap data for multiple goals over a date range
 * Uses optimized batch queries for better performance
 */
export async function getMultiGoalHeatmapData(
  startDate: string,
  endDate: string,
  goalIds?: string[]
): Promise<HeatmapData[]> {
  const db = await getDatabase();

  // Generate all dates in range
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const startDateStr = format(new Date(startDate), 'yyyy-MM-dd');
  const endDateStr = format(new Date(endDate), 'yyyy-MM-dd');

  // Batch query: Get completions per day
  const completionsQuery = goalIds?.length
    ? `SELECT date(completed_at) as date_str, COUNT(DISTINCT goal_id) as completion_count
       FROM log_entries
       WHERE goal_id IN (${goalIds.map(() => '?').join(',')})
       AND date(completed_at) >= ?
       AND date(completed_at) <= ?
       GROUP BY date(completed_at)`
    : `SELECT date(completed_at) as date_str, COUNT(DISTINCT goal_id) as completion_count
       FROM log_entries
       WHERE date(completed_at) >= ?
       AND date(completed_at) <= ?
       GROUP BY date(completed_at)`;

  const completionsParams = goalIds?.length
    ? [...goalIds, startDateStr, endDateStr]
    : [startDateStr, endDateStr];

  const completionsResults = await db.getAllAsync<DayCompletionData>(
    completionsQuery,
    completionsParams
  );

  // Create a map of date -> completion count
  const completionsMap = new Map<string, number>();
  completionsResults.forEach((row) => {
    completionsMap.set(row.date_str, row.completion_count);
  });

  // For goals, we need to count active goals per day
  // This is more complex - we need to check each day individually
  // Let's get all goals and check their date ranges
  const goalsQuery = goalIds?.length
    ? `SELECT id, date(start_date) as start_str, date(end_date) as end_str
       FROM habits
       WHERE id IN (${goalIds.map(() => '?').join(',')})
       AND is_archived = 0`
    : `SELECT id, date(start_date) as start_str, date(end_date) as end_str
       FROM habits
       WHERE is_archived = 0`;

  const goalsParams = goalIds?.length ? goalIds : [];

  const goalsResults = await db.getAllAsync<{
    id: string;
    start_str: string;
    end_str: string | null;
  }>(goalsQuery, goalsParams);

  // Build heatmap data for each day
  const heatmapData: HeatmapData[] = [];

  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Count goals active on this date
    let totalGoals = 0;
    for (const goal of goalsResults) {
      const goalStart = goal.start_str;
      const goalEnd = goal.end_str;

      if (goalStart <= dateStr && (goalEnd === null || goalEnd >= dateStr)) {
        totalGoals++;
      }
    }

    const completionCount = completionsMap.get(dateStr) ?? 0;

    // Calculate intensity (0-4)
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (totalGoals > 0) {
      const percentage = (completionCount / totalGoals) * 100;
      if (percentage === 0) intensity = 0;
      else if (percentage <= 25) intensity = 1;
      else if (percentage <= 50) intensity = 2;
      else if (percentage <= 75) intensity = 3;
      else intensity = 4;
    }

    heatmapData.push({
      date: dateStr,
      completionCount,
      totalGoals,
      intensity,
    });
  }

  return heatmapData;
}

/**
 * Get heatmap data for a single goal over a date range
 * Used for goal detail view (binary heatmap)
 */
export async function getSingleGoalHeatmapData(
  goalId: string,
  startDate: string,
  endDate: string
): Promise<HeatmapData[]> {
  const db = await getDatabase();

  // Generate all dates in range
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const startDateStr = format(new Date(startDate), 'yyyy-MM-dd');
  const endDateStr = format(new Date(endDate), 'yyyy-MM-dd');

  // Batch query: Get completions per day for this goal
  const completionsResults = await db.getAllAsync<DayCompletionData>(
    `SELECT date(completed_at) as date_str, COUNT(*) as completion_count
     FROM log_entries
     WHERE goal_id = ?
     AND date(completed_at) >= ?
     AND date(completed_at) <= ?
     GROUP BY date(completed_at)`,
    [goalId, startDateStr, endDateStr]
  );

  // Create a map of date -> completion count
  const completionsMap = new Map<string, number>();
  completionsResults.forEach((row) => {
    completionsMap.set(row.date_str, row.completion_count);
  });

  const heatmapData: HeatmapData[] = [];

  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completionCount = completionsMap.get(dateStr) ?? 0;
    const isCompleted = completionCount > 0;

    heatmapData.push({
      date: dateStr,
      completionCount,
      totalGoals: 1,
      intensity: isCompleted ? 4 : 0,
      isCompleted,
    });
  }

  return heatmapData;
}

/**
 * Get completion statistics for a goal over a period
 */
export async function getCompletionStats(
  goalId: string,
  startDate: string,
  endDate: string
): Promise<{ totalCompletions: number; completionRate: number }> {
  const db = await getDatabase();

  const dayStart = startOfDay(new Date(startDate)).toISOString();
  const dayEnd = endOfDay(new Date(endDate)).toISOString();

  // Count total completions
  const completionsResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM log_entries
     WHERE goal_id = ?
     AND completed_at >= ?
     AND completed_at <= ?`,
    [goalId, dayStart, dayEnd]
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
 * Get overall statistics across all goals
 */
export async function getOverallStats(): Promise<{
  totalGoals: number;
  activeGoals: number;
  recurringGoals: number;
  finiteGoals: number;
  totalCompletionsToday: number;
  totalCompletionsThisWeek: number;
  totalCompletionsThisMonth: number;
  totalCompletionsAllTime: number;
}> {
  const db = await getDatabase();

  // Total goals
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits'
  );
  const totalGoals = totalResult?.count ?? 0;

  // Active goals - use date() for proper date comparison
  const today = format(new Date(), 'yyyy-MM-dd');
  const activeResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habits
     WHERE is_archived = 0
     AND date(start_date) <= date(?)
     AND (end_date IS NULL OR date(end_date) >= date(?))`,
    [today, today]
  );
  const activeGoals = activeResult?.count ?? 0;

  // Recurring goals count
  const recurringResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habits
     WHERE is_archived = 0
     AND goal_type = 'recurring'`
  );
  const recurringGoals = recurringResult?.count ?? 0;

  // Finite goals count
  const finiteResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habits
     WHERE is_archived = 0
     AND goal_type = 'finite'`
  );
  const finiteGoals = finiteResult?.count ?? 0;

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
    totalGoals,
    activeGoals,
    recurringGoals,
    finiteGoals,
    totalCompletionsToday,
    totalCompletionsThisWeek,
    totalCompletionsThisMonth,
    totalCompletionsAllTime,
  };
}

// Legacy aliases for backwards compatibility
export const getMultiHabitHeatmapData = getMultiGoalHeatmapData;
export const getSingleHabitHeatmapData = getSingleGoalHeatmapData;
