// Completion percentage calculation logic

import type { Goal, LogEntry, CompletionStats, FiniteGoalProgress } from '@/types/models';
import {
  startOfDay,
  endOfDay,
  getDateString,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysDifference,
} from './date-helpers';

/**
 * Calculate progress for a finite goal
 * Shows overall progress toward the target count
 */
export function calculateFiniteGoalProgress(
  goal: Goal,
  logEntries: LogEntry[]
): FiniteGoalProgress {
  const now = new Date();
  const startDate = new Date(goal.startDate);
  const endDate = goal.endDate ? new Date(goal.endDate) : now;

  // Count total completions (each log entry is one completion)
  const completed = logEntries.length;
  const target = goal.targetCount;
  const percentage = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;

  // Calculate days
  const totalDays = Math.max(1, getDaysDifference(endDate, startDate) + 1);
  const daysElapsed = Math.max(0, getDaysDifference(now, startDate) + 1);
  const daysRemaining = Math.max(0, getDaysDifference(endDate, now));

  const isComplete = completed >= target;
  const isOverdue = !isComplete && now > endDate;

  return {
    completed,
    target,
    percentage,
    daysRemaining,
    daysElapsed,
    totalDays,
    isComplete,
    isOverdue,
  };
}

/**
 * Calculate completion statistics for a recurring goal over a period
 */
export function calculateCompletionStats(
  goal: Goal,
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
  const expectedCompletions = calculateExpectedCompletions(goal, startDate, endDate);

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
 * Calculate expected number of completions based on goal's time range and target count
 */
function calculateExpectedCompletions(goal: Goal, startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Adjust start date if before goal start
  const goalStart = new Date(goal.startDate);
  const effectiveStart = start < goalStart ? goalStart : start;

  // Adjust end date if after goal end (if specified)
  let effectiveEnd = end;
  if (goal.endDate) {
    const goalEnd = new Date(goal.endDate);
    if (end > goalEnd) {
      effectiveEnd = goalEnd;
    }
  }

  // If effective start is after effective end, return 0
  if (effectiveStart > effectiveEnd) {
    return 0;
  }

  const totalDays = getDaysDifference(effectiveEnd, effectiveStart) + 1; // +1 to include both start and end

  switch (goal.timeRange) {
    case 'daily':
      // Daily goals: expected = target count × number of days
      return goal.targetCount * totalDays;

    case 'weekly':
      // Weekly goals: calculate number of complete + partial weeks
      const totalWeeks = Math.ceil(totalDays / 7);
      return goal.targetCount * totalWeeks;

    case 'monthly':
      // Monthly goals: calculate number of complete + partial months
      const monthsDiff = getMonthsDifference(effectiveStart, effectiveEnd);
      const totalMonths = Math.ceil(monthsDiff);
      return goal.targetCount * totalMonths;

    case 'custom':
      if (!goal.customTimeRange) {
        return goal.targetCount * totalDays;
      }

      // Calculate period length in days
      let periodLengthInDays = 1;
      if (goal.customTimeRange.unit === 'days') {
        periodLengthInDays = goal.customTimeRange.value;
      } else if (goal.customTimeRange.unit === 'weeks') {
        periodLengthInDays = goal.customTimeRange.value * 7;
      } else if (goal.customTimeRange.unit === 'months') {
        periodLengthInDays = goal.customTimeRange.value * 30; // Approximate
      }

      const totalPeriods = Math.ceil(totalDays / periodLengthInDays);
      return goal.targetCount * totalPeriods;

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
 * Calculate completion rate for current period (recurring goals only)
 */
export function calculateCurrentPeriodCompletion(
  goal: Goal,
  logEntries: LogEntry[]
): CompletionStats {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date = now;

  switch (goal.timeRange) {
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
      if (!goal.customTimeRange) {
        periodStart = startOfDay(now);
        periodEnd = endOfDay(now);
      } else {
        // Find current custom period based on goal start date
        const goalStart = new Date(goal.startDate);
        const daysSinceStart = getDaysDifference(now, goalStart);

        let periodLengthInDays = 1;
        if (goal.customTimeRange.unit === 'days') {
          periodLengthInDays = goal.customTimeRange.value;
        } else if (goal.customTimeRange.unit === 'weeks') {
          periodLengthInDays = goal.customTimeRange.value * 7;
        } else if (goal.customTimeRange.unit === 'months') {
          periodLengthInDays = goal.customTimeRange.value * 30;
        }

        const periodNumber = Math.floor(daysSinceStart / periodLengthInDays);
        periodStart = new Date(
          goalStart.getTime() + periodNumber * periodLengthInDays * 24 * 60 * 60 * 1000
        );
        periodEnd = new Date(
          goalStart.getTime() + (periodNumber + 1) * periodLengthInDays * 24 * 60 * 60 * 1000 - 1
        );
      }
      break;

    default:
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
  }

  return calculateCompletionStats(goal, logEntries, periodStart, periodEnd);
}

/**
 * Get the completion count for the current period (for recurring goals)
 */
export function getCompletionCountForCurrentPeriod(
  goal: Goal,
  logEntries: LogEntry[]
): number {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  switch (goal.timeRange) {
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
      if (!goal.customTimeRange) {
        periodStart = startOfDay(now);
        periodEnd = endOfDay(now);
      } else {
        const goalStart = new Date(goal.startDate);
        const daysSinceStart = getDaysDifference(now, goalStart);

        let periodLengthInDays = 1;
        if (goal.customTimeRange.unit === 'days') {
          periodLengthInDays = goal.customTimeRange.value;
        } else if (goal.customTimeRange.unit === 'weeks') {
          periodLengthInDays = goal.customTimeRange.value * 7;
        } else if (goal.customTimeRange.unit === 'months') {
          periodLengthInDays = goal.customTimeRange.value * 30;
        }

        const periodNumber = Math.floor(daysSinceStart / periodLengthInDays);
        periodStart = new Date(
          goalStart.getTime() + periodNumber * periodLengthInDays * 24 * 60 * 60 * 1000
        );
        periodEnd = new Date(
          goalStart.getTime() + (periodNumber + 1) * periodLengthInDays * 24 * 60 * 60 * 1000 - 1
        );
      }
      break;

    default:
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
  }

  // Count completions in the current period
  return logEntries.filter((log) => {
    const completedDate = new Date(log.completedAt);
    return completedDate >= periodStart && completedDate <= periodEnd;
  }).length;
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
