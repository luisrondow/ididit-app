# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IDidIt** is a mobile habit tracker application that helps users build and maintain positive habits through goal setting, activity logging, and visual progress tracking.

This is a React Native app built with Expo and styled with NativeWind (Tailwind CSS for React Native). The project uses the React Native Reusables component library and follows the "New York" style variant.

**Core Value Proposition:** Simple, flexible habit tracking with customizable time ranges and clear visual feedback on progress.

**Status:** MVP Complete (All 10 implementation phases finished)

## Key Technologies

### Runtime & Package Manager
- **Bun** - JavaScript runtime and package manager

### Framework & Platform
- **Expo SDK 54** - React Native framework with New Architecture enabled
- **Expo Router** - File-based routing with typed routes
- **React Native 0.81** - Cross-platform mobile framework
- **React 19** - UI library

### Styling
- **NativeWind v4** - Tailwind CSS for React Native
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities

### Data Layer
- **expo-sqlite** - Local SQLite database for data persistence
- **Zustand** - Lightweight state management
- **date-fns** - Date manipulation utilities

### UI Components
- **React Native Reusables** - shadcn-style UI components for React Native
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Smooth animations
- **React Native Safe Area Context** - Safe area handling

### UX Enhancements
- **expo-haptics** - Haptic feedback for tactile responses

### Development
- **TypeScript** - Type safety with strict mode enabled
- **Prettier** - Code formatting with Tailwind plugin

## Development Commands

```bash
# Start development server (clears cache)
bun run dev

# Platform-specific development
bun run ios        # iOS simulator (Mac only)
bun run android    # Android emulator
bun run web        # Web browser

# Clean project (removes .expo and node_modules)
bun run clean

# Type checking
npx tsc --noEmit
```

**Note:** All dev commands use `-c` flag to clear cache by default.

## Architecture & Structure

### File Structure
```
app/
├── _layout.tsx              # Root layout (providers, error boundary, status bar)
├── index.tsx                # Redirect to tabs
├── +not-found.tsx           # 404 handling
├── +html.tsx                # Web HTML wrapper
├── (tabs)/
│   ├── _layout.tsx          # Bottom tab navigation
│   ├── index.tsx            # Dashboard screen
│   ├── calendar.tsx         # Calendar heatmap view
│   └── statistics.tsx       # Statistics screen
└── habit/
    ├── new.tsx              # Create habit screen
    ├── [id].tsx             # Edit habit screen
    └── detail/
        └── [id].tsx         # Habit detail view

components/
├── ui/                      # Reusable UI primitives
│   ├── button.tsx
│   ├── text.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── icon.tsx
│   ├── switch.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx         # Loading skeleton components
│   └── toast.tsx            # Toast notification component
├── error-boundary.tsx       # Error boundary for crash prevention
├── habit-card.tsx           # Habit display card with actions
├── habit-heatmap.tsx        # Binary heatmap for single habit
├── calendar-heatmap.tsx     # Multi-tone heatmap for all habits
└── screen-header.tsx        # Consistent screen header component

lib/
├── db/
│   ├── init.ts              # Database initialization
│   ├── schema.ts            # SQLite table definitions
│   └── migrations.ts        # Database migration system
├── repositories/
│   ├── habit-repository.ts  # Habit CRUD operations
│   ├── log-repository.ts    # Log entry CRUD operations
│   └── stats-repository.ts  # Aggregation queries
├── store/
│   ├── habits-store.ts      # Zustand store for habits
│   └── logs-store.ts        # Zustand store for logs
├── context/
│   └── toast-context.tsx    # Toast notification provider
├── utils/
│   ├── date-helpers.ts      # Date utilities (wrappers around date-fns)
│   ├── validators.ts        # Form and data validation
│   ├── streak-calculator.ts # Streak calculation logic
│   ├── completion-calculator.ts # Completion percentage logic
│   └── haptics.ts           # Haptic feedback utilities
├── theme.ts                 # Navigation theme colors
└── utils.ts                 # cn() utility for class merging

types/
└── models.ts                # TypeScript interfaces
```

### Routing (Expo Router)
- File-based routing in `app/` directory
- Tab navigation with Dashboard, Calendar, and Statistics
- Dynamic routes for habit detail and editing
- Typed routes enabled via `experiments.typedRoutes` in app.json

### Data Flow
1. **Database Layer** (expo-sqlite) - Persistent storage
2. **Repository Layer** - CRUD operations and queries
3. **Store Layer** (Zustand) - Application state management
4. **Component Layer** - React components with hooks

### Styling System
- **Global styles:** `global.css` contains CSS variable definitions for theming
- **Theme configuration:** `lib/theme.ts` defines navigation theme colors
- **Utility function:** `lib/utils.ts` exports `cn()` for merging Tailwind classes
- **Dark mode:** Class-based (`darkMode: 'class'` in tailwind.config.js)
- **Color scheme:** Managed via NativeWind's `useColorScheme()` hook
- **Design system:** Uses HSL CSS variables (--primary, --secondary, --accent, etc.)

## Data Models

```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  customTimeRange?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
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
  completedAt: string;    // When the habit was completed
  loggedAt: string;       // When the user logged it
  notes?: string;
}

interface HeatmapData {
  date: string;
  completionCount: number;
  totalHabits: number;
  intensity: number;      // 0-4 for multi-tone heatmap
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}
```

## App Features

### 1. Habit Management
- Create habits with name, description, category
- Time range options: Daily, Weekly, Monthly, Custom
- Target frequency (e.g., "5 times per week")
- Edit and delete habits
- Archive/unarchive habits

### 2. Activity Logging
- Quick one-tap logging from dashboard
- Automatic timestamps
- Visual completion indicators
- Progress tracking (e.g., "3/5 completed")

### 3. Visualizations
- **Dashboard:** Today's habits with completion status and streaks
- **Calendar View:** GitHub-style multi-tone heatmap (5 intensity levels)
- **Habit Detail:** Binary heatmap with streak and completion stats
- **Statistics:** Overall metrics, best performers, completion rates

### 4. Streak Tracking
- Current streak calculation for all time ranges
- Longest streak history
- Visual streak badges on habit cards

### 5. UX Polish
- Toast notifications for all user actions
- Haptic feedback on interactions
- Skeleton loading states
- Pull-to-refresh on all lists
- Dark mode support
- Error boundary for crash prevention

## Configuration Files

### Metro (metro.config.js)
- Configured with NativeWind integration
- Global CSS file: `./global.css`
- Inline rem value: 16px

### Babel (babel.config.js)
- Preset: `babel-preset-expo` with `jsxImportSource: 'nativewind'`
- NativeWind babel preset included

### TypeScript (tsconfig.json)
- Strict mode enabled
- Base URL: `.` (project root)
- Path alias: `@/*` maps to project root
- Extends Expo's base config

### Expo (app.json)
- New Architecture: enabled (`newArchEnabled: true`)
- Android: Edge-to-edge enabled
- Web bundler: Metro with static output
- UI style: automatic (light/dark)
- Custom scheme: `ididit-app`

### Components (components.json)
- Style: "new-york"
- Base color: "neutral"
- CSS variables enabled
- Aliases: @/components, @/lib, @/ui, @/hooks

## Adding UI Components

Use the React Native Reusables CLI to add pre-built components:
```bash
npx @react-native-reusables/cli@latest add [component-names]
# Interactive mode
npx @react-native-reusables/cli@latest add
# Install all components
npx @react-native-reusables/cli@latest add --all
```

## Database

### SQLite Tables
- `habits` - Habit definitions
- `log_entries` - Completion logs with foreign key to habits

### Indexes
- `idx_log_entries_habit_id` - For efficient habit log queries
- `idx_log_entries_completed_at` - For date range queries
- `idx_habits_is_archived` - For filtering active habits

### Migrations
- Version tracking via `PRAGMA user_version`
- Automatic migration on app start
- Located in `lib/db/migrations.ts`

## Platform Support

This app runs on iOS, Android, and Web:
- **iOS:** Full support including haptics
- **Android:** Full support including haptics
- **Web:** Full support (haptics gracefully disabled)

Fully supports Expo Go for quick testing on physical devices.

## Deployment

Configured for deployment via Expo Application Services (EAS):
- EAS Build for building native apps
- EAS Updates for OTA updates
- EAS Submit for app store submissions

## Testing

See `TESTING.md` for the comprehensive test plan with 100+ test cases covering:
- Habit management flows
- Logging and streak calculations
- Visualizations and heatmaps
- Navigation and data persistence
- Edge cases and error handling
- Cross-platform compatibility

## Design Principles

- **Simple & Fast:** Minimize taps to log a habit
- **Visual Feedback:** Clear indication of progress and completion
- **Encouraging:** Positive reinforcement for streaks
- **Flexible:** Support various habit types and tracking patterns
- **Resilient:** Error boundaries and graceful degradation

## Common Tasks

### Creating a New Screen
1. Add file in `app/` directory following Expo Router conventions
2. Use `SafeAreaView` with `edges={['top']}`
3. Include `ScreenHeader` component
4. Integrate with stores using Zustand hooks

### Adding Database Migrations
1. Increment `CURRENT_DB_VERSION` in `lib/db/migrations.ts`
2. Add migration case in `runMigration()` function
3. Test migration path from previous version

### Using Toast Notifications
```typescript
import { useToast } from '@/lib/context/toast-context';

const toast = useToast();
toast.success('Operation completed!');
toast.error('Something went wrong');
toast.warning('Are you sure?');
toast.info('Did you know...');
```

### Using Haptic Feedback
```typescript
import { haptics } from '@/lib/utils/haptics';

haptics.light();    // Light touch feedback
haptics.medium();   // Standard interaction
haptics.heavy();    // Important action
haptics.success();  // Completion feedback
haptics.error();    // Error feedback
haptics.warning();  // Warning feedback
```

## Out of Scope (Future Features)
- Cloud sync/backup
- Social features
- Habit templates
- Push notifications/reminders
- Data export/import
- Advanced analytics
