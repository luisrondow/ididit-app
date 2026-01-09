// Core data models for IDidIt goal tracker

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category?: string; // Freeform text
  goalType: 'recurring' | 'finite'; // Recurring resets each period, finite is one-time target
  // Recurring: period for target reset (daily = 1x/day means reset daily)
  // Finite: ignored (uses startDate to endDate as total timeframe)
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  customTimeRange?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  targetCount: number; // How many times (per period for recurring, total for finite)
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601, required for finite goals, optional for recurring
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  isArchived: boolean;
}

// Alias for backwards compatibility during migration
export type Habit = Goal;

export interface LogEntry {
  id: string;
  goalId: string; // Reference to goal
  completedAt: string; // ISO 8601 - When the goal action was completed
  loggedAt: string; // ISO 8601 - When the user logged it
  notes?: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface CompletionStats {
  totalCompletions: number;
  completionRate: number; // 0-100
  periodStart: string; // ISO 8601
  periodEnd: string; // ISO 8601
}

export interface FiniteGoalProgress {
  completed: number;
  target: number;
  percentage: number; // 0-100
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  isComplete: boolean;
  isOverdue: boolean;
}

export interface HeatmapData {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  completionCount: number;
  totalGoals: number;
  intensity: 0 | 1 | 2 | 3 | 4; // Intensity level for multi-tone heatmap
  isCompleted?: boolean; // For binary heatmap
}
