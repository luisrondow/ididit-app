// Date utility functions (wrappers around date-fns)

import {
  format as dateFnsFormat,
  startOfDay as dateFnsStartOfDay,
  endOfDay as dateFnsEndOfDay,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  startOfMonth as dateFnsStartOfMonth,
  endOfMonth as dateFnsEndOfMonth,
  startOfYear as dateFnsStartOfYear,
  endOfYear as dateFnsEndOfYear,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  differenceInDays,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isToday as dateFnsIsToday,
  isSameDay,
  parseISO,
  eachDayOfInterval,
} from 'date-fns';

/**
 * Format a date to a specific format
 */
export function formatDate(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, formatStr);
}

/**
 * Get ISO string for a date
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.toISOString();
}

/**
 * Get start of day (00:00:00.000)
 */
export function startOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsStartOfDay(dateObj);
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsEndOfDay(dateObj);
}

/**
 * Get start of week (Sunday)
 */
export function startOfWeek(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsStartOfWeek(dateObj);
}

/**
 * Get end of week (Saturday)
 */
export function endOfWeek(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsEndOfWeek(dateObj);
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsStartOfMonth(dateObj);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsEndOfMonth(dateObj);
}

/**
 * Get start of year
 */
export function startOfYear(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsStartOfYear(dateObj);
}

/**
 * Get end of year
 */
export function endOfYear(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsEndOfYear(dateObj);
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsIsToday(dateObj);
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(dateObj1, dateObj2);
}

/**
 * Check if date1 is after date2
 */
export function isDateAfter(date1: Date | string, date2: Date | string): boolean {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(dateObj1, dateObj2);
}

/**
 * Check if date1 is before date2
 */
export function isDateBefore(date1: Date | string, date2: Date | string): boolean {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(dateObj1, dateObj2);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
}

/**
 * Add weeks to a date
 */
export function addWeeksToDate(date: Date | string, weeks: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addWeeks(dateObj, weeks);
}

/**
 * Subtract weeks from a date
 */
export function subtractWeeksFromDate(date: Date | string, weeks: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subWeeks(dateObj, weeks);
}

/**
 * Add months to a date
 */
export function addMonthsToDate(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(dateObj, months);
}

/**
 * Subtract months from a date
 */
export function subtractMonthsFromDate(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subMonths(dateObj, months);
}

/**
 * Get difference in days between two dates
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(dateObj1, dateObj2);
}

/**
 * Get difference in calendar days between two dates
 */
export function getCalendarDaysDifference(
  date1: Date | string,
  date2: Date | string
): number {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInCalendarDays(dateObj1, dateObj2);
}

/**
 * Get all days in an interval
 */
export function getDaysInInterval(start: Date | string, end: Date | string): Date[] {
  const startObj = typeof start === 'string' ? parseISO(start) : start;
  const endObj = typeof end === 'string' ? parseISO(end) : end;
  return eachDayOfInterval({ start: startObj, end: endObj });
}

/**
 * Get today's date at midnight
 */
export function getTodayStart(): Date {
  return startOfDay(new Date());
}

/**
 * Get current date/time as ISO string
 */
export function getNowISO(): string {
  return new Date().toISOString();
}

/**
 * Get date-only string (YYYY-MM-DD) from ISO string or Date
 */
export function getDateString(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd');
}
