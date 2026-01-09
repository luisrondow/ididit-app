// Streak calculation logic (for recurring goals only)

import type { Goal, LogEntry, StreakInfo } from '@/types/models';
import {
  startOfDay,
  getDaysDifference,
  subtractDaysFromDate,
  subtractWeeksFromDate,
  subtractMonthsFromDate,
  getDateString,
} from './date-helpers';

/**
 * Calculate streak information for a goal
 * Note: Streaks are only meaningful for recurring goals.
 * For finite goals, this will return zeros.
 */
export function calculateStreak(
  goal: Goal,
  logEntries: LogEntry[],
  referenceDate?: Date
): StreakInfo {
  // Streaks don't apply to finite goals - return zeros
  if (goal.goalType === 'finite') {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate:
        logEntries.length > 0
          ? logEntries.sort(
              (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )[0].completedAt
          : undefined,
    };
  }

  const now = referenceDate ?? new Date();

  // Sort log entries by completion date (newest first)
  const sortedLogs = [...logEntries].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  if (sortedLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Get unique completion dates (in case multiple logs per day)
  const completionDates = getUniqueCompletionDates(sortedLogs);

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(goal, completionDates, now);

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(goal, completionDates);

  // Get last completed date
  const lastCompletedDate = completionDates.length > 0 ? completionDates[0] : undefined;

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
  };
}

/**
 * Get unique completion dates from log entries
 */
function getUniqueCompletionDates(logEntries: LogEntry[]): string[] {
  const dateSet = new Set<string>();

  for (const log of logEntries) {
    const dateStr = getDateString(log.completedAt);
    dateSet.add(dateStr);
  }

  // Return sorted array (newest first)
  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

/**
 * Calculate current streak based on goal's time range
 */
function calculateCurrentStreak(
  goal: Goal,
  completionDates: string[],
  referenceDate: Date
): number {
  if (completionDates.length === 0) {
    return 0;
  }

  // Group completion dates by period (same approach as longestStreak)
  const periodSet = new Set<string>();
  for (const dateStr of completionDates) {
    const date = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone issues
    const periodStart = getPeriodStart(goal, date);
    const periodKey = getDateString(periodStart);
    periodSet.add(periodKey);
  }

  // Sort periods (newest first)
  const sortedPeriods = Array.from(periodSet).sort((a, b) => b.localeCompare(a));

  if (sortedPeriods.length === 0) {
    return 0;
  }

  // Get today's period
  const today = startOfDay(referenceDate);
  const todayPeriodKey = getDateString(getPeriodStart(goal, today));

  // Find the starting point for current streak
  // If today has a completion, start from today
  // Otherwise, start from yesterday's period
  let startIndex = 0;
  if (sortedPeriods[0] !== todayPeriodKey) {
    // Today doesn't have a completion
    // Check if the most recent completion is from the previous period
    const yesterdayPeriod = subtractOnePeriod(goal, today);
    const yesterdayPeriodKey = getDateString(yesterdayPeriod);

    if (sortedPeriods[0] !== yesterdayPeriodKey) {
      // Most recent completion is older than yesterday - no current streak
      return 0;
    }
    // Start counting from yesterday
    startIndex = 0;
  }

  // Count consecutive periods
  let streak = 0;
  let expectedPeriodKey = sortedPeriods[startIndex];

  for (let i = startIndex; i < sortedPeriods.length; i++) {
    const periodKey = sortedPeriods[i];

    if (periodKey === expectedPeriodKey) {
      streak++;
      // Calculate the expected previous period
      const currentPeriod = new Date(periodKey + 'T12:00:00'); // Use noon to avoid timezone issues
      const prevPeriod = subtractOnePeriod(goal, currentPeriod);
      expectedPeriodKey = getDateString(prevPeriod);
    } else {
      // Gap found - streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak
 */
function calculateLongestStreak(goal: Goal, completionDates: string[]): number {
  if (completionDates.length === 0) {
    return 0;
  }

  let longestStreak = 0;
  let currentStreakCount = 0;
  let lastPeriodStart: Date | null = null;

  // Group completion dates by period
  const periodGroups = new Map<string, string[]>();

  for (const dateStr of completionDates) {
    const date = new Date(dateStr);
    const periodStart = getPeriodStart(goal, date);
    const periodKey = getDateString(periodStart);

    if (!periodGroups.has(periodKey)) {
      periodGroups.set(periodKey, []);
    }
    periodGroups.get(periodKey)!.push(dateStr);
  }

  // Sort periods (newest first)
  const sortedPeriods = Array.from(periodGroups.keys()).sort((a, b) => b.localeCompare(a));

  // Find longest consecutive streak
  for (let i = 0; i < sortedPeriods.length; i++) {
    const periodKey = sortedPeriods[i];
    const periodStart = new Date(periodKey);

    if (lastPeriodStart === null) {
      // First period
      currentStreakCount = 1;
      lastPeriodStart = periodStart;
    } else {
      // Check if this period is consecutive with the last one
      const expectedPrevPeriod = subtractOnePeriod(goal, lastPeriodStart);
      const expectedPrevPeriodStr = getDateString(expectedPrevPeriod);

      if (periodKey === expectedPrevPeriodStr) {
        // Consecutive period
        currentStreakCount++;
        lastPeriodStart = periodStart;
      } else {
        // Gap found - reset streak
        longestStreak = Math.max(longestStreak, currentStreakCount);
        currentStreakCount = 1;
        lastPeriodStart = periodStart;
      }
    }
  }

  // Check final streak
  longestStreak = Math.max(longestStreak, currentStreakCount);

  return longestStreak;
}

/**
 * Get the start of the period for a given date based on goal's time range
 */
function getPeriodStart(goal: Goal, date: Date): Date {
  const dateObj = startOfDay(date);

  switch (goal.timeRange) {
    case 'daily':
      return dateObj;

    case 'weekly':
      // Start of week (Sunday)
      const dayOfWeek = dateObj.getDay();
      return subtractDaysFromDate(dateObj, dayOfWeek);

    case 'monthly':
      // Start of month
      const monthStart = new Date(dateObj);
      monthStart.setDate(1);
      return startOfDay(monthStart);

    case 'custom':
      if (!goal.customTimeRange) {
        return dateObj;
      }

      // For custom ranges, we'll use the goal's start date as anchor
      const goalStart = startOfDay(new Date(goal.startDate));
      const daysSinceStart = getDaysDifference(dateObj, goalStart);

      let periodLengthInDays = 1;
      if (goal.customTimeRange.unit === 'days') {
        periodLengthInDays = goal.customTimeRange.value;
      } else if (goal.customTimeRange.unit === 'weeks') {
        periodLengthInDays = goal.customTimeRange.value * 7;
      } else if (goal.customTimeRange.unit === 'months') {
        periodLengthInDays = goal.customTimeRange.value * 30; // Approximate
      }

      const periodNumber = Math.floor(daysSinceStart / periodLengthInDays);
      return new Date(
        goalStart.getTime() + periodNumber * periodLengthInDays * 24 * 60 * 60 * 1000
      );

    default:
      return dateObj;
  }
}

/**
 * Subtract one period from a date based on goal's time range
 */
function subtractOnePeriod(goal: Goal, date: Date): Date {
  switch (goal.timeRange) {
    case 'daily':
      return subtractDaysFromDate(date, 1);

    case 'weekly':
      return subtractWeeksFromDate(date, 1);

    case 'monthly':
      return subtractMonthsFromDate(date, 1);

    case 'custom':
      if (!goal.customTimeRange) {
        return subtractDaysFromDate(date, 1);
      }

      if (goal.customTimeRange.unit === 'days') {
        return subtractDaysFromDate(date, goal.customTimeRange.value);
      } else if (goal.customTimeRange.unit === 'weeks') {
        return subtractWeeksFromDate(date, goal.customTimeRange.value);
      } else if (goal.customTimeRange.unit === 'months') {
        return subtractMonthsFromDate(date, goal.customTimeRange.value);
      }

      return subtractDaysFromDate(date, 1);

    default:
      return subtractDaysFromDate(date, 1);
  }
}
