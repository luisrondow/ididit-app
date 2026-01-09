// Zustand store for goals

import { create } from 'zustand';
import type { Goal } from '@/types/models';
import {
  createGoal,
  getGoalById,
  getAllGoals,
  getActiveGoals,
  getGoalsByType,
  updateGoal,
  deleteGoal,
  archiveGoal,
} from '../repositories/goal-repository';

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadGoals: (includeArchived?: boolean) => Promise<void>;
  loadActiveGoals: (date?: string) => Promise<void>;
  loadGoalsByType: (goalType: 'recurring' | 'finite', includeArchived?: boolean) => Promise<void>;
  getGoal: (id: string) => Promise<Goal | null>;
  addGoal: (goal: Goal) => Promise<void>;
  editGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  toggleArchive: (id: string, isArchived: boolean) => Promise<void>;
  clearError: () => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  loadGoals: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await getAllGoals(includeArchived);
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load goals';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading goals:', error);
    }
  },

  loadActiveGoals: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await getActiveGoals(date);
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load active goals';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading active goals:', error);
    }
  },

  loadGoalsByType: async (goalType: 'recurring' | 'finite', includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await getGoalsByType(goalType, includeArchived);
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load goals by type';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading goals by type:', error);
    }
  },

  getGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const goal = await getGoalById(id);
      set({ isLoading: false });
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get goal';
      set({ error: errorMessage, isLoading: false });
      console.error('Error getting goal:', error);
      return null;
    }
  },

  addGoal: async (goal: Goal) => {
    set({ isLoading: true, error: null });
    try {
      await createGoal(goal);
      const goals = await getAllGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  editGoal: async (goal: Goal) => {
    set({ isLoading: true, error: null });
    try {
      await updateGoal(goal);
      const goals = await getAllGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  removeGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteGoal(id);
      const goals = await getAllGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
      set({ error: errorMessage, isLoading: false });
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  toggleArchive: async (id: string, isArchived: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await archiveGoal(id, isArchived);
      const goals = await getAllGoals();
      set({ goals, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive goal';
      set({ error: errorMessage, isLoading: false });
      console.error('Error archiving goal:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Legacy alias for backwards compatibility
export const useHabitsStore = useGoalsStore;

