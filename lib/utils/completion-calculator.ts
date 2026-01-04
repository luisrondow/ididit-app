// Completion percentage calculation logic

import type { Habit, LogEntry, CompletionStats } from '@/types/models';
import {
  startOfDay,
  endOfDay,
  getDaysInInterval,
  getDateString,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysDifference,
} from './date-helpers';

/**
 * Calculate completion statistics for a habit over a period
 */
export function calculateCompletionStats(
  habit: Habit,
  logEntries: LogEntry[],
  periodStart: Date,
  periodEnd: Date
): CompletionStats {
  const startDate = startOfDay(periodStart);
  const endDate = endOfDay(periodEnd);

  // Filter log entries within the period
  const logsInPeriod = logEntries.filter((log) => {
    const completedDate = new Date(log.completedAt);
    return completedDate >= startDate && completedDate <= endDate;
  });

  // Get unique completion dates
  const uniqueDates = getUniqueCompletionDates(logsInPeriod);
  const totalCompletions = uniqueDates.length;

  // Calculate expected completions based on time range
  const expectedCompletions = calculateExpectedCompletions(habit, startDate, endDate);

  // Calculate completion rate
  const completionRate =
    expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;

  return {
    totalCompletions,
    completionRate: Math.min(100, Math.round(completionRate * 10) / 10), // Round to 1 decimal, cap at 100%
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
}

/**
 * Calculate expected number of completions based on habit's time range and target frequency
 */
function calculateExpectedCompletions(habit: Habit, startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Adjust start date if before habit start
  const habitStart = new Date(habit.startDate);
  const effectiveStart = start < habitStart ? habitStart : start;

  // Adjust end date if after habit end (if specified)
  let effectiveEnd = end;
  if (habit.endDate) {
    const habitEnd = new Date(habit.endDate);
    if (end > habitEnd) {
      effectiveEnd = habitEnd;
    }
  }

  // If effective start is after effective end, return 0
  if (effectiveStart > effectiveEnd) {
    return 0;
  }

  const totalDays = getDaysDifference(effectiveEnd, effectiveStart) + 1; // +1 to include both start and end

  switch (habit.timeRange) {
    case 'daily':
      // Daily habits: expected = target frequency × number of days
      return habit.targetFrequency * totalDays;

    case 'weekly':
      // Weekly habits: calculate number of complete + partial weeks
      const totalWeeks = Math.ceil(totalDays / 7);
      return habit.targetFrequency * totalWeeks;

    case 'monthly':
      // Monthly habits: calculate number of complete + partial months
      const monthsDiff = getMonthsDifference(effectiveStart, effectiveEnd);
      const totalMonths = Math.ceil(monthsDiff);
      return habit.targetFrequency * totalMonths;

    case 'custom':
      if (!habit.customTimeRange) {
        return habit.targetFrequency * totalDays;
      }

      // Calculate period length in days
      let periodLengthInDays = 1;
      if (habit.customTimeRange.unit === 'days') {
        periodLengthInDays = habit.customTimeRange.value;
      } else if (habit.customTimeRange.unit === 'weeks') {
        periodLengthInDays = habit.customTimeRange.value * 7;
      } else if (habit.customTimeRange.unit === 'months') {
        periodLengthInDays = habit.customTimeRange.value * 30; // Approximate
      }

      const totalPeriods = Math.ceil(totalDays / periodLengthInDays);
      return habit.targetFrequency * totalPeriods;

    default:
      return 0;
  }
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

  return Array.from(dateSet);
}

/**
 * Calculate completion rate for current period
 */
export function calculateCurrentPeriodCompletion(
  habit: Habit,
  logEntries: LogEntry[]
): CompletionStats {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date = now;

  switch (habit.timeRange) {
    case 'daily':
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
      break;

    case 'weekly':
      periodStart = startOfWeek(now);
      periodEnd = endOfWeek(now);
      break;

    case 'monthly':
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
      break;

    case 'custom':
      if (!habit.customTimeRange) {
        periodStart = startOfDay(now);
        periodEnd = endOfDay(now);
      } else {
        // Find current custom period based on habit start date
        const habitStart = new Date(habit.startDate);
        const daysSinceStart = getDaysDifference(now, habitStart);

        let periodLengthInDays = 1;
        if (habit.customTimeRange.unit === 'days') {
          periodLengthInDays = habit.customTimeRange.value;
        } else if (habit.customTimeRange.unit === 'weeks') {
          periodLengthInDays = habit.customTimeRange.value * 7;
        } else if (habit.customTimeRange.unit === 'months') {
          periodLengthInDays = habit.customTimeRange.value * 30;
        }

        const periodNumber = Math.floor(daysSinceStart / periodLengthInDays);
        periodStart = new Date(
          habitStart.getTime() + periodNumber * periodLengthInDays * 24 * 60 * 60 * 1000
        );
        periodEnd = new Date(
          habitStart.getTime() + (periodNumber + 1) * periodLengthInDays * 24 * 60 * 60 * 1000 - 1
        );
      }
      break;

    default:
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
  }

  return calculateCompletionStats(habit, logEntries, periodStart, periodEnd);
}

/**
 * Calculate difference in months between two dates
 */
function getMonthsDifference(start: Date, end: Date): number {
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;

  // Add partial month if end day is after start day
  const dayDiff = end.getDate() - start.getDate();
  return totalMonths + (dayDiff >= 0 ? 1 : 0);
}
