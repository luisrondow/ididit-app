// Zustand store for habits

import { create } from 'zustand';
import type { Habit } from '@/types/models';
import {
  createHabit,
  getHabitById,
  getAllHabits,
  getActiveHabits,
  updateHabit,
  deleteHabit,
  archiveHabit,
} from '../repositories/habit-repository';

interface HabitsState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHabits: (includeArchived?: boolean) => Promise<void>;
  loadActiveHabits: (date?: string) => Promise<void>;
  getHabit: (id: string) => Promise<Habit | null>;
  addHabit: (habit: Habit) => Promise<void>;
  editHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleArchive: (id: string, isArchived: boolean) => Promise<void>;
  clearError: () => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  loadHabits: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const habits = await getAllHabits(includeArchived);
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load habits';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading habits:', error);
    }
  },

  loadActiveHabits: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const habits = await getActiveHabits(date);
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load active habits';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading active habits:', error);
    }
  },

  getHabit: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const habit = await getHabitById(id);
      set({ isLoading: false });
      return habit;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get habit';
      set({ error: errorMessage, isLoading: false });
      console.error('Error getting habit:', error);
      return null;
    }
  },

  addHabit: async (habit: Habit) => {
    set({ isLoading: true, error: null });
    try {
      await createHabit(habit);
      const habits = await getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create habit';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  editHabit: async (habit: Habit) => {
    set({ isLoading: true, error: null });
    try {
      await updateHabit(habit);
      const habits = await getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update habit';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  removeHabit: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteHabit(id);
      const habits = await getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete habit';
      set({ error: errorMessage, isLoading: false });
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  toggleArchive: async (id: string, isArchived: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await archiveHabit(id, isArchived);
      const habits = await getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive habit';
      set({ error: errorMessage, isLoading: false });
      console.error('Error archiving habit:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
