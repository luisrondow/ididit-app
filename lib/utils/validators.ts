// Form and data validation utilities

import type { Habit } from '@/types/models';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate habit data
 */
export function validateHabit(habit: Partial<Habit>): ValidationResult {
  const errors: ValidationError[] = [];

  // Name is required
  if (!habit.name || habit.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Habit name is required',
    });
  } else if (habit.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Habit name must be less than 100 characters',
    });
  }

  // Description length check
  if (habit.description && habit.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 500 characters',
    });
  }

  // Category length check
  if (habit.category && habit.category.length > 50) {
    errors.push({
      field: 'category',
      message: 'Category must be less than 50 characters',
    });
  }

  // Time range is required
  if (!habit.timeRange) {
    errors.push({
      field: 'timeRange',
      message: 'Time range is required',
    });
  } else if (!['daily', 'weekly', 'monthly', 'custom'].includes(habit.timeRange)) {
    errors.push({
      field: 'timeRange',
      message: 'Invalid time range',
    });
  }

  // Custom time range validation
  if (habit.timeRange === 'custom') {
    if (!habit.customTimeRange) {
      errors.push({
        field: 'customTimeRange',
        message: 'Custom time range is required when time range is set to custom',
      });
    } else {
      if (!habit.customTimeRange.value || habit.customTimeRange.value < 1) {
        errors.push({
          field: 'customTimeRange.value',
          message: 'Custom time range value must be at least 1',
        });
      }
      if (
        !habit.customTimeRange.unit ||
        !['days', 'weeks', 'months'].includes(habit.customTimeRange.unit)
      ) {
        errors.push({
          field: 'customTimeRange.unit',
          message: 'Invalid custom time range unit',
        });
      }
    }
  }

  // Target frequency is required and must be positive
  if (!habit.targetFrequency || habit.targetFrequency < 1) {
    errors.push({
      field: 'targetFrequency',
      message: 'Target frequency must be at least 1',
    });
  } else if (habit.targetFrequency > 1000) {
    errors.push({
      field: 'targetFrequency',
      message: 'Target frequency must be less than 1000',
    });
  }

  // Start date is required
  if (!habit.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required',
    });
  } else if (!isValidISODate(habit.startDate)) {
    errors.push({
      field: 'startDate',
      message: 'Invalid start date format',
    });
  }

  // End date validation (if provided)
  if (habit.endDate) {
    if (!isValidISODate(habit.endDate)) {
      errors.push({
        field: 'endDate',
        message: 'Invalid end date format',
      });
    } else if (habit.startDate && new Date(habit.endDate) < new Date(habit.startDate)) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate log entry completion date
 */
export function validateLogDate(completedAt: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!completedAt) {
    errors.push({
      field: 'completedAt',
      message: 'Completion date is required',
    });
  } else if (!isValidISODate(completedAt)) {
    errors.push({
      field: 'completedAt',
      message: 'Invalid completion date format',
    });
  } else {
    // Cannot log future dates
    const completedDate = new Date(completedAt);
    const now = new Date();
    if (completedDate > now) {
      errors.push({
        field: 'completedAt',
        message: 'Cannot log completions in the future',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate log entry notes
 */
export function validateLogNotes(notes?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (notes && notes.length > 500) {
    errors.push({
      field: 'notes',
      message: 'Notes must be less than 500 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a string is a valid ISO 8601 date
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Sanitize user input (trim whitespace, prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate and sanitize habit name
 */
export function sanitizeHabitName(name: string): string {
  return sanitizeString(name).substring(0, 100);
}

/**
 * Validate and sanitize description
 */
export function sanitizeDescription(description: string): string {
  return sanitizeString(description).substring(0, 500);
}

/**
 * Validate and sanitize category
 */
export function sanitizeCategory(category: string): string {
  return sanitizeString(category).substring(0, 50);
}

/**
 * Validate and sanitize notes
 */
export function sanitizeNotes(notes: string): string {
  return sanitizeString(notes).substring(0, 500);
}
