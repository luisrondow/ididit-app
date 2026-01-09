# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IDidIt** is a fully functional mobile goal tracker application that helps users achieve both recurring habits and finite goals through activity logging and visual progress tracking.

This is a React Native app built with Expo and styled with NativeWind (Tailwind CSS for React Native). The project uses the React Native Reusables component library and follows the "New York" style variant.

**Core Value Proposition:** Flexible goal tracking with support for both recurring habits (daily/weekly targets with streaks) and finite goals (fixed target count within a timeframe with progress tracking).

**Goal Types:**
- **Recurring Goals**: Actions performed X times per period (daily, weekly, monthly). Tracks streaks and period completion.
- **Finite Goals**: Actions performed X times total within a deadline. Tracks overall progress percentage and time remaining.

**Key Technologies:**
- **Bun** as the JavaScript runtime and package manager
- **Expo SDK 54** with New Architecture enabled
- **Expo Router** for file-based routing with typed routes
- **NativeWind v4** for Tailwind CSS styling
- **React Native Reusables** for UI components (shadcn-style for React Native)
- **TypeScript** with strict mode enabled
- **SQLite** (expo-sqlite) for local data persistence
- **Zustand** for state management
- **date-fns** for date manipulation
- **Lucide React Native** for icons

## Development Commands

```bash
# Start development server (clears cache)
npm run dev

# Platform-specific development
npm run ios        # iOS simulator (Mac only)
npm run android    # Android emulator
npm run web        # Web browser

# Clean project (removes .expo and node_modules)
npm run clean
```

**Note:** All dev commands use `-c` flag to clear cache by default.

## Architecture & Structure

### Directory Structure

```
app/                              # Expo Router screens
├── _layout.tsx                   # Root layout (DB init, theme, toast provider)
├── index.tsx                     # Redirects to (tabs)
├── +not-found.tsx                # 404 handling
├── +html.tsx                     # Web HTML wrapper
├── (tabs)/
│   ├── _layout.tsx               # Tab navigation (Home, Calendar, Stats)
│   ├── index.tsx                 # Dashboard screen (goals list)
│   ├── calendar.tsx              # Calendar heatmap view
│   └── logs.tsx                  # Activity log
├── statistics.tsx                # Statistics screen (stack)
└── habit/
    ├── new.tsx                   # Create new goal form
    ├── [id].tsx                  # Edit goal screen
    └── detail/
        └── [id].tsx              # Goal detail with type-specific stats

components/
├── ui/                           # Base UI components (React Native Reusables)
│   ├── button.tsx, text.tsx, input.tsx, label.tsx
│   ├── textarea.tsx, icon.tsx, skeleton.tsx
│   ├── switch.tsx, separator.tsx, toast.tsx
├── goal-card.tsx                 # Goal card with type-specific display
├── habit-card.tsx                # Legacy alias for goal-card
├── habit-heatmap.tsx             # Binary heatmap (single goal)
├── calendar-heatmap.tsx          # Multi-tone heatmap (all goals)
├── screen-header.tsx             # Reusable screen header
└── error-boundary.tsx            # App-level error boundary

lib/
├── db/
│   ├── init.ts                   # Database initialization & management
│   ├── schema.ts                 # SQLite table definitions
│   └── migrations.ts             # Database version migrations
├── repositories/                 # Data access layer
│   ├── goal-repository.ts        # Goal CRUD operations
│   ├── habit-repository.ts       # Legacy alias for goal-repository
│   ├── log-repository.ts         # Log entry CRUD operations
│   └── stats-repository.ts       # Aggregation queries for stats/heatmaps
├── store/                        # Zustand state stores
│   ├── goals-store.ts            # Goal state management
│   ├── habits-store.ts           # Legacy alias for goals-store
│   └── logs-store.ts             # Log entry state management
├── context/
│   └── toast-context.tsx         # Toast notification context
├── utils/
│   ├── streak-calculator.ts      # Streak calculation (recurring goals only)
│   ├── completion-calculator.ts  # Completion rate & finite goal progress
│   ├── date-helpers.ts           # date-fns wrappers
│   ├── validators.ts             # Form & data validation
│   └── haptics.ts                # Haptic feedback utilities
├── theme.ts                      # Navigation theme configuration
└── utils.ts                      # General utilities (cn function)

types/
└── models.ts                     # TypeScript interfaces
```

### Routing (Expo Router)

| Route | Screen | Description |
|-------|--------|-------------|
| `/(tabs)` | Tab Navigator | Bottom tabs: Home, Calendar, Logs |
| `/(tabs)/index` | Dashboard | Today's goals with quick logging |
| `/(tabs)/calendar` | Calendar | Multi-goal heatmap with month navigation |
| `/(tabs)/logs` | Activity Log | Recent completions across all goals |
| `/statistics` | Statistics | Overall progress and insights |
| `/habit/new` | Create Goal | New goal form with type selector |
| `/habit/[id]` | Edit Goal | Edit existing goal |
| `/habit/detail/[id]` | Goal Detail | Type-specific stats and heatmap |

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│              Screens (app/)                 │
├─────────────────────────────────────────────┤
│           Components (components/)          │
├─────────────────────────────────────────────┤
│         State Management (lib/store/)       │
│              Zustand Stores                 │
├─────────────────────────────────────────────┤
│        Data Access (lib/repositories/)      │
│            Repository Pattern               │
├─────────────────────────────────────────────┤
│           Database (lib/db/)                │
│          SQLite via expo-sqlite             │
└─────────────────────────────────────────────┘
```

## Data Models

```typescript
// types/models.ts

interface Goal {
  id: string;
  name: string;
  description?: string;
  category?: string;
  goalType: 'recurring' | 'finite';  // Determines tracking behavior
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';  // For recurring goals
  customTimeRange?: { value: number; unit: 'days' | 'weeks' | 'months' };
  targetCount: number;      // X times per period (recurring) or total (finite)
  startDate: string;        // ISO 8601
  endDate?: string;         // Required for finite goals, optional for recurring
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface LogEntry {
  id: string;
  goalId: string;
  completedAt: string;    // When goal action was completed
  loggedAt: string;       // When user logged it
  notes?: string;
}

interface StreakInfo {
  currentStreak: number;    // Consecutive periods with completion
  longestStreak: number;
  lastCompletedDate?: string;
}

interface FiniteGoalProgress {
  completed: number;        // Completions so far
  target: number;           // Target count
  percentage: number;       // 0-100
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  isComplete: boolean;
  isOverdue: boolean;
}

interface HeatmapData {
  date: string;
  completionCount: number;
  totalGoals: number;
  intensity: 0 | 1 | 2 | 3 | 4;  // For multi-tone heatmap
  isCompleted?: boolean;         // For binary heatmap
}
```

## Goal Types Explained

### Recurring Goals
- **Use case**: "Go to gym 3x per week", "Meditate daily"
- **Tracking**: Resets each period (day/week/month)
- **Metrics**: Current streak, longest streak, period completion
- **UI**: Segmented progress ring, streak badge

### Finite Goals
- **Use case**: "Read 10 books this year", "Complete 50 coding sessions"
- **Tracking**: Progress toward fixed target with deadline
- **Metrics**: Progress percentage, days remaining, completion count
- **UI**: Progress bar, percentage display, deadline indicator

## Database Schema

**Tables:**
- `habits` (named for backwards compatibility) - Goal definitions
  - Indexes: `is_archived`, `start_date`, `goal_type`
  - Columns: `goal_type` (recurring/finite), `target_count`
- `log_entries` - Completion logs
  - Foreign key to goals (CASCADE delete)
  - Indexes: `goal_id`, `completed_at`

**Migration**: Database v2 adds `goal_type` column with default `'recurring'` for existing data.

## State Management

**Zustand Stores:**

| Store | State | Key Actions |
|-------|-------|-------------|
| `goalsStore` | goals[], isLoading, error | loadGoals, loadActiveGoals, loadGoalsByType, addGoal, editGoal, removeGoal, toggleArchive |
| `logsStore` | logs[], isLoading, error | loadLogsByGoalId, addLog, removeLog |

## Key Utilities

| File | Purpose |
|------|---------|
| `streak-calculator.ts` | Calculate streaks (recurring goals only, returns 0 for finite) |
| `completion-calculator.ts` | Calculate completion rates and finite goal progress |
| `date-helpers.ts` | Date manipulation wrappers (date-fns) |
| `validators.ts` | Form validation (validates goalType, endDate for finite goals) |
| `haptics.ts` | Haptic feedback (light, medium, heavy, success, error) |

## Styling System

- **Global styles:** `global.css` with CSS variables for theming
- **Theme config:** `lib/theme.ts` for navigation colors
- **Utility function:** `cn()` from `lib/utils.ts` for class merging
- **Dark mode:** Class-based (`darkMode: 'class'` in tailwind.config.js)
- **Heatmap colors:** 5 intensity levels defined in global.css

### Adding UI Components

```bash
npx @react-native-reusables/cli@latest add [component-names]
```

Components configured via `components.json` (Style: "new-york", Base: "neutral").

## Implemented Features

**Dashboard:**
- Today's active goals separated by type (recurring/finite)
- Type-specific progress display (ring for recurring, bar for finite)
- One-tap logging with haptic feedback
- Goal cards showing type, streak/progress, category
- Pull-to-refresh

**Goal Creation/Editing:**
- Goal type selector (recurring vs finite)
- Recurring: Time range and target per period
- Finite: Target count and deadline picker
- Validation based on goal type

**Goal Detail:**
- **Recurring**: Current/longest streak, 30-day completion rate
- **Finite**: Progress percentage, completion count, days remaining, deadline
- Heatmap visualization (both types)

**Calendar View:**
- Multi-tone GitHub-style heatmap (5 intensity levels)
- Month navigation (1-12 months range)
- Summary stats (active days, avg completion rate)

**Statistics:**
- Goals count by type (total, active, recurring, finite)
- Completions breakdown (today, week, month, all-time)
- Highlights: Best streak, closest to completion, most completed

**Polish:**
- Loading skeletons
- Toast notifications
- Error boundary
- Haptic feedback
- Dark mode support

## Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo config (New Architecture, edge-to-edge, typed routes) |
| `metro.config.js` | NativeWind integration |
| `babel.config.js` | JSX import source for NativeWind |
| `tailwind.config.js` | Tailwind configuration with custom heatmap colors |
| `tsconfig.json` | TypeScript with strict mode, path aliases |
| `components.json` | React Native Reusables configuration |

## Platform Support

Runs on iOS, Android, and Web. Fully supports Expo Go for development.

## Future Enhancements (Out of Current Scope)

- Cloud sync/backup
- Notifications/reminders
- Goal templates
- Advanced analytics
- Social features
- Data export
