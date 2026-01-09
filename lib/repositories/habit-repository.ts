// Legacy re-export for backwards compatibility
// All functionality has been moved to goal-repository.ts

export {
  createGoal as createHabit,
  getGoalById as getHabitById,
  getAllGoals as getAllHabits,
  getActiveGoals as getActiveHabits,
  updateGoal as updateHabit,
  deleteGoal as deleteHabit,
  archiveGoal as archiveHabit,
} from './goal-repository';
