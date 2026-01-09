// Zustand store for log entries

import { create } from 'zustand';
import type { LogEntry } from '@/types/models';
import {
  createLogEntry,
  getLogEntryById,
  getLogEntriesByGoalId,
  getLogEntriesByDateRange,
  getLogEntriesByDate,
  getAllLogEntries,
  updateLogEntry,
  deleteLogEntry,
  deleteLogEntriesByGoalId,
  type LogEntryWithGoal,
} from '../repositories/log-repository';

interface LogsState {
  logs: LogEntry[];
  allLogs: LogEntryWithGoal[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLogsByGoalId: (goalId: string) => Promise<void>;
  loadLogsByDateRange: (goalId: string, startDate: string, endDate: string) => Promise<void>;
  loadLogsByDate: (date: string) => Promise<void>;
  loadAllLogs: () => Promise<void>;
  getLog: (id: string) => Promise<LogEntry | null>;
  addLog: (logEntry: LogEntry) => Promise<void>;
  editLog: (logEntry: LogEntry) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  removeLogsByGoalId: (goalId: string) => Promise<void>;
  clearError: () => void;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  allLogs: [],
  isLoading: false,
  error: null,

  loadLogsByGoalId: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await getLogEntriesByGoalId(goalId);
      set({ logs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading logs:', error);
    }
  },

  loadLogsByDateRange: async (goalId: string, startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await getLogEntriesByDateRange(goalId, startDate, endDate);
      set({ logs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading logs by date range:', error);
    }
  },

  loadLogsByDate: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await getLogEntriesByDate(date);
      set({ logs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading logs by date:', error);
    }
  },

  loadAllLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const allLogs = await getAllLogEntries();
      set({ allLogs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load all logs';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading all logs:', error);
    }
  },

  getLog: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const log = await getLogEntryById(id);
      set({ isLoading: false });
      return log;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get log';
      set({ error: errorMessage, isLoading: false });
      console.error('Error getting log:', error);
      return null;
    }
  },

  addLog: async (logEntry: LogEntry) => {
    set({ isLoading: true, error: null });
    try {
      await createLogEntry(logEntry);
      // Reload logs for the goal
      const logs = await getLogEntriesByGoalId(logEntry.goalId);
      set({ logs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create log';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating log:', error);
      throw error;
    }
  },

  editLog: async (logEntry: LogEntry) => {
    set({ isLoading: true, error: null });
    try {
      await updateLogEntry(logEntry);
      // Reload logs for the goal
      const logs = await getLogEntriesByGoalId(logEntry.goalId);
      set({ logs, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update log';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating log:', error);
      throw error;
    }
  },

  removeLog: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const currentLogs = get().logs;
      const log = currentLogs.find((l) => l.id === id);

      await deleteLogEntry(id);

      // Reload logs for the goal if we know which goal it belongs to
      if (log) {
        const logs = await getLogEntriesByGoalId(log.goalId);
        set({ logs, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete log';
      set({ error: errorMessage, isLoading: false });
      console.error('Error deleting log:', error);
      throw error;
    }
  },

  removeLogsByGoalId: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteLogEntriesByGoalId(goalId);
      set({ logs: [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete logs';
      set({ error: errorMessage, isLoading: false });
      console.error('Error deleting logs:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
