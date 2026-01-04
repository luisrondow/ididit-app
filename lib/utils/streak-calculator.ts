// Streak calculation logic

import type { Habit, LogEntry, StreakInfo } from '@/types/models';
import {
  startOfDay,
  endOfDay,
  isSameDate,
  getDaysDifference,
  subtractDaysFromDate,
  subtractWeeksFromDate,
  subtractMonthsFromDate,
  getDateString,
} from './date-helpers';

/**
 * Calculate streak information for a habit
 */
export function calculateStreak(
  habit: Habit,
  logEntries: LogEntry[],
  referenceDate?: Date
): StreakInfo {
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
  const currentStreak = calculateCurrentStreak(habit, completionDates, now);

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(habit, completionDates);

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
 * Calculate current streak based on habit's time range
 */
function calculateCurrentStreak(
  habit: Habit,
  completionDates: string[],
  referenceDate: Date
): number {
  if (completionDates.length === 0) {
    return 0;
  }

  const today = startOfDay(referenceDate);
  const todayStr = getDateString(today);

  // Check if habit is active today
  const habitStartDate = new Date(habit.startDate);
  if (habitStartDate > today) {
    return 0; // Habit hasn't started yet
  }

  let streak = 0;
  let currentPeriodStart = today;

  // Walk backwards through time periods
  while (true) {
    const periodStart = getPeriodStart(habit, currentPeriodStart);
    const periodStartStr = getDateString(periodStart);

    // Check if any completion falls within this period
    const hasCompletionInPeriod = completionDates.some((dateStr) => {
      return dateStr >= periodStartStr && dateStr <= getDateString(currentPeriodStart);
    });

    if (!hasCompletionInPeriod) {
      break; // Streak is broken
    }

    streak++;

    // Move to previous period
    currentPeriodStart = subtractOnePeriod(habit, periodStart);

    // Don't go before habit start date
    if (currentPeriodStart < habitStartDate) {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak
 */
function calculateLongestStreak(habit: Habit, completionDates: string[]): number {
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
    const periodStart = getPeriodStart(habit, date);
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
      const expectedPrevPeriod = subtractOnePeriod(habit, lastPeriodStart);
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
 * Get the start of the period for a given date based on habit's time range
 */
function getPeriodStart(habit: Habit, date: Date): Date {
  const dateObj = startOfDay(date);

  switch (habit.timeRange) {
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
      if (!habit.customTimeRange) {
        return dateObj;
      }

      // For custom ranges, we'll use the habit's start date as anchor
      const habitStart = startOfDay(new Date(habit.startDate));
      const daysSinceStart = getDaysDifference(dateObj, habitStart);

      let periodLengthInDays = 1;
      if (habit.customTimeRange.unit === 'days') {
        periodLengthInDays = habit.customTimeRange.value;
      } else if (habit.customTimeRange.unit === 'weeks') {
        periodLengthInDays = habit.customTimeRange.value * 7;
      } else if (habit.customTimeRange.unit === 'months') {
        periodLengthInDays = habit.customTimeRange.value * 30; // Approximate
      }

      const periodNumber = Math.floor(daysSinceStart / periodLengthInDays);
      return new Date(habitStart.getTime() + periodNumber * periodLengthInDays * 24 * 60 * 60 * 1000);

    default:
      return dateObj;
  }
}

/**
 * Subtract one period from a date based on habit's time range
 */
function subtractOnePeriod(habit: Habit, date: Date): Date {
  switch (habit.timeRange) {
    case 'daily':
      return subtractDaysFromDate(date, 1);

    case 'weekly':
      return subtractWeeksFromDate(date, 1);

    case 'monthly':
      return subtractMonthsFromDate(date, 1);

    case 'custom':
      if (!habit.customTimeRange) {
        return subtractDaysFromDate(date, 1);
      }

      if (habit.customTimeRange.unit === 'days') {
        return subtractDaysFromDate(date, habit.customTimeRange.value);
      } else if (habit.customTimeRange.unit === 'weeks') {
        return subtractWeeksFromDate(date, habit.customTimeRange.value);
      } else if (habit.customTimeRange.unit === 'months') {
        return subtractMonthsFromDate(date, habit.customTimeRange.value);
      }

      return subtractDaysFromDate(date, 1);

    default:
      return subtractDaysFromDate(date, 1);
  }
}
