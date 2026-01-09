// Form and data validation utilities

import type { Goal } from '@/types/models';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate goal data
 */
export function validateGoal(goal: Partial<Goal>): ValidationResult {
  const errors: ValidationError[] = [];

  // Name is required
  if (!goal.name || goal.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Goal name is required',
    });
  } else if (goal.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Goal name must be less than 100 characters',
    });
  }

  // Description length check
  if (goal.description && goal.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 500 characters',
    });
  }

  // Category length check
  if (goal.category && goal.category.length > 50) {
    errors.push({
      field: 'category',
      message: 'Category must be less than 50 characters',
    });
  }

  // Goal type is required
  if (!goal.goalType) {
    errors.push({
      field: 'goalType',
      message: 'Goal type is required',
    });
  } else if (!['recurring', 'finite'].includes(goal.goalType)) {
    errors.push({
      field: 'goalType',
      message: 'Invalid goal type',
    });
  }

  // Time range validation (only for recurring goals)
  if (goal.goalType === 'recurring') {
    if (!goal.timeRange) {
      errors.push({
        field: 'timeRange',
        message: 'Time range is required for recurring goals',
      });
    } else if (!['daily', 'weekly', 'monthly', 'custom'].includes(goal.timeRange)) {
      errors.push({
        field: 'timeRange',
        message: 'Invalid time range',
      });
    }

    // Custom time range validation
    if (goal.timeRange === 'custom') {
      if (!goal.customTimeRange) {
        errors.push({
          field: 'customTimeRange',
          message: 'Custom time range is required when time range is set to custom',
        });
      } else {
        if (!goal.customTimeRange.value || goal.customTimeRange.value < 1) {
          errors.push({
            field: 'customTimeRange.value',
            message: 'Custom time range value must be at least 1',
          });
        }
        if (
          !goal.customTimeRange.unit ||
          !['days', 'weeks', 'months'].includes(goal.customTimeRange.unit)
        ) {
          errors.push({
            field: 'customTimeRange.unit',
            message: 'Invalid custom time range unit',
          });
        }
      }
    }
  }

  // Finite goals require an end date
  if (goal.goalType === 'finite') {
    if (!goal.endDate) {
      errors.push({
        field: 'endDate',
        message: 'Deadline is required for finite goals',
      });
    }
  }

  // Target count is required and must be positive
  if (!goal.targetCount || goal.targetCount < 1) {
    errors.push({
      field: 'targetCount',
      message: 'Target count must be at least 1',
    });
  } else if (goal.targetCount > 10000) {
    errors.push({
      field: 'targetCount',
      message: 'Target count must be less than 10000',
    });
  }

  // Start date is required
  if (!goal.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required',
    });
  } else if (!isValidISODate(goal.startDate)) {
    errors.push({
      field: 'startDate',
      message: 'Invalid start date format',
    });
  }

  // End date validation (if provided)
  if (goal.endDate) {
    if (!isValidISODate(goal.endDate)) {
      errors.push({
        field: 'endDate',
        message: 'Invalid end date format',
      });
    } else if (goal.startDate && new Date(goal.endDate) < new Date(goal.startDate)) {
      errors.push({
        field: 'endDate',
        message: 'Deadline must be after start date',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Legacy alias
export const validateHabit = validateGoal;

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
 * Validate and sanitize goal name
 */
export function sanitizeGoalName(name: string): string {
  return sanitizeString(name).substring(0, 100);
}

// Legacy alias
export const sanitizeHabitName = sanitizeGoalName;

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
