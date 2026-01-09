// SQLite database schema for IDidIt

export const CREATE_GOALS_TABLE = `
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    goal_type TEXT NOT NULL DEFAULT 'recurring' CHECK(goal_type IN ('recurring', 'finite')),
    time_range TEXT NOT NULL CHECK(time_range IN ('daily', 'weekly', 'monthly', 'custom')),
    custom_time_range_value INTEGER,
    custom_time_range_unit TEXT CHECK(custom_time_range_unit IN ('days', 'weeks', 'months')),
    target_count INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_archived INTEGER NOT NULL DEFAULT 0
  );
`;

// Legacy table for backwards compatibility during migration
export const CREATE_HABITS_TABLE = `
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    goal_type TEXT NOT NULL DEFAULT 'recurring' CHECK(goal_type IN ('recurring', 'finite')),
    time_range TEXT NOT NULL CHECK(time_range IN ('daily', 'weekly', 'monthly', 'custom')),
    custom_time_range_value INTEGER,
    custom_time_range_unit TEXT CHECK(custom_time_range_unit IN ('days', 'weeks', 'months')),
    target_count INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_archived INTEGER NOT NULL DEFAULT 0
  );
`;

export const CREATE_LOG_ENTRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS log_entries (
    id TEXT PRIMARY KEY NOT NULL,
    goal_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    logged_at TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (goal_id) REFERENCES habits(id) ON DELETE CASCADE
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_habits_is_archived ON habits(is_archived);
  CREATE INDEX IF NOT EXISTS idx_habits_goal_type ON habits(goal_type);
  CREATE INDEX IF NOT EXISTS idx_habits_start_date ON habits(start_date);
  CREATE INDEX IF NOT EXISTS idx_log_entries_goal_id ON log_entries(goal_id);
  CREATE INDEX IF NOT EXISTS idx_log_entries_completed_at ON log_entries(completed_at);
  CREATE INDEX IF NOT EXISTS idx_log_entries_goal_completed ON log_entries(goal_id, completed_at);
`;

export const DROP_TABLES = `
  DROP TABLE IF EXISTS log_entries;
  DROP TABLE IF EXISTS habits;
  DROP TABLE IF EXISTS goals;
`;
