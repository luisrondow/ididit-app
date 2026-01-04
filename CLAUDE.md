# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IDidIt** is a fully functional mobile habit tracker application that helps users build and maintain positive habits through goal setting, activity logging, and visual progress tracking.

This is a React Native app built with Expo and styled with NativeWind (Tailwind CSS for React Native). The project uses the React Native Reusables component library and follows the "New York" style variant.

**Core Value Proposition:** Simple, flexible habit tracking with customizable time ranges and clear visual feedback on progress.

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
│   ├── index.tsx                 # Dashboard screen
│   ├── calendar.tsx              # Calendar heatmap view
│   └── statistics.tsx            # Statistics screen
└── habit/
    ├── new.tsx                   # Create new habit form
    ├── [id].tsx                  # Edit habit screen
    └── detail/
        └── [id].tsx              # Habit detail with heatmap

components/
├── ui/                           # Base UI components (React Native Reusables)
│   ├── button.tsx, text.tsx, input.tsx, label.tsx
│   ├── textarea.tsx, icon.tsx, skeleton.tsx
│   ├── switch.tsx, separator.tsx, toast.tsx
├── habit-card.tsx                # Habit card with completion & actions
├── habit-heatmap.tsx             # Binary heatmap (single habit)
├── calendar-heatmap.tsx          # Multi-tone heatmap (all habits)
├── screen-header.tsx             # Reusable screen header
└── error-boundary.tsx            # App-level error boundary

lib/
├── db/
│   ├── init.ts                   # Database initialization & management
│   ├── schema.ts                 # SQLite table definitions
│   └── migrations.ts             # Database version migrations
├── repositories/                 # Data access layer
│   ├── habit-repository.ts       # Habit CRUD operations
│   ├── log-repository.ts         # Log entry CRUD operations
│   └── stats-repository.ts       # Aggregation queries for stats/heatmaps
├── store/                        # Zustand state stores
│   ├── habits-store.ts           # Habit state management
│   └── logs-store.ts             # Log entry state management
├── context/
│   └── toast-context.tsx         # Toast notification context
├── utils/
│   ├── streak-calculator.ts      # Streak calculation logic
│   ├── completion-calculator.ts  # Completion rate calculations
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
| `/(tabs)` | Tab Navigator | Bottom tabs: Home, Calendar, Statistics |
| `/(tabs)/index` | Dashboard | Today's habits with quick logging |
| `/(tabs)/calendar` | Calendar | Multi-habit heatmap with month navigation |
| `/(tabs)/statistics` | Statistics | Overall progress and insights |
| `/habit/new` | Create Habit | New habit form |
| `/habit/[id]` | Edit Habit | Edit existing habit |
| `/habit/detail/[id]` | Habit Detail | Individual habit stats and heatmap |

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

interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  customTimeRange?: { value: number; unit: 'days' | 'weeks' | 'months' };
  targetFrequency: number;
  startDate: string;      // ISO 8601
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface LogEntry {
  id: string;
  habitId: string;
  completedAt: string;    // When habit was completed
  loggedAt: string;       // When user logged it
  notes?: string;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

interface CompletionStats {
  totalCompletions: number;
  completionRate: number;
  periodStart: string;
  periodEnd: string;
}

interface HeatmapData {
  date: string;
  completionCount: number;
  totalHabits: number;
  intensity: 0 | 1 | 2 | 3 | 4;  // For multi-tone heatmap
  isCompleted?: boolean;         // For binary heatmap
}
```

## Database Schema

**Tables:**
- `habits` - Habit definitions with indexes on `is_archived` and `start_date`
- `log_entries` - Completion logs with foreign key to habits (CASCADE delete), indexes on `habit_id`, `completed_at`

## State Management

**Zustand Stores:**

| Store | State | Key Actions |
|-------|-------|-------------|
| `habitsStore` | habits[], isLoading, error | loadHabits, addHabit, editHabit, removeHabit, toggleArchive |
| `logsStore` | logs[], isLoading, error | loadLogsByHabitId, addLog, removeLog |

## Key Utilities

| File | Purpose |
|------|---------|
| `streak-calculator.ts` | Calculate current/longest streaks for all time ranges |
| `completion-calculator.ts` | Calculate completion rates and stats |
| `date-helpers.ts` | Date manipulation wrappers (date-fns) |
| `validators.ts` | Form validation, prevents future date logging |
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
- Today's active habits with completion progress
- One-tap logging with haptic feedback
- Habit cards showing streak, category, target frequency
- Pull-to-refresh

**Calendar View:**
- Multi-tone GitHub-style heatmap (5 intensity levels)
- Month navigation (1-12 months range)
- Summary stats (active days, avg completion rate)

**Habit Detail:**
- Binary heatmap showing completion per day
- Current streak and longest streak
- 30-day completion rate
- Total completions count
- Edit/delete actions

**Statistics:**
- Overall habits count (total, active)
- Completions breakdown (today, week, month, all-time)
- Top performers (best streak, most completed)

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
- Habit templates
- Advanced analytics
- Social features
- Data export
