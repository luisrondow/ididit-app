// Core data models for IDidIt habit tracker

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string; // Freeform text
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  customTimeRange?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  targetFrequency: number; // How many times per time range
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601, optional for time-bound goals
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  isArchived: boolean;
}

export interface LogEntry {
  id: string;
  habitId: string;
  completedAt: string; // ISO 8601 - When the habit was actually completed
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

export interface HeatmapData {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  completionCount: number;
  totalHabits: number;
  intensity: 0 | 1 | 2 | 3 | 4; // Intensity level for multi-tone heatmap
  isCompleted?: boolean; // For binary heatmap
}
