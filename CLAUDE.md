# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IDidIt** is a mobile habit tracker application that helps users build and maintain positive habits through goal setting, activity logging, and visual progress tracking.

This is a React Native app built with Expo and styled with NativeWind (Tailwind CSS for React Native). The project uses the React Native Reusables component library and follows the "New York" style variant.

**Core Value Proposition:** Simple, flexible habit tracking with customizable time ranges and clear visual feedback on progress.

**Key Technologies:**
- **Bun** as the JavaScript runtime and package manager
- **Expo SDK 54** with New Architecture enabled
- **Expo Router** for file-based routing with typed routes
- **NativeWind v4** for Tailwind CSS styling
- **React Native Reusables** for UI components (shadcn-style for React Native)
- **TypeScript** with strict mode enabled
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

### Routing (Expo Router)
- File-based routing in `app/` directory
- `app/_layout.tsx` - Root layout with theme provider, status bar, and portal host
- `app/index.tsx` - Home screen
- `app/+not-found.tsx` - 404 handling
- `app/+html.tsx` - Web HTML wrapper
- Typed routes enabled via `experiments.typedRoutes` in app.json

### Styling System
- **Global styles:** `global.css` contains CSS variable definitions for theming
- **Theme configuration:** `lib/theme.ts` defines navigation theme colors for light/dark modes
- **Utility function:** `lib/utils.ts` exports `cn()` for merging Tailwind classes
- **Dark mode:** Uses class-based dark mode (`darkMode: 'class'` in tailwind.config.js)
- **Color scheme:** Managed via NativeWind's `useColorScheme()` hook
- **Design system:** Uses HSL CSS variables (--primary, --secondary, --accent, etc.)

### Component Organization
- **UI components:** `components/ui/` - Reusable primitives (button, text, icon)
- **Custom components:** `components/` - App-specific components
- **Path aliases:** Use `@/` prefix for all imports (configured in tsconfig.json and components.json)

### Adding Components
Use the React Native Reusables CLI to add pre-built components:
```bash
npx @react-native-reusables/cli@latest add [component-names]
# Interactive mode (no component names specified)
npx @react-native-reusables/cli@latest add
# Install all components
npx @react-native-reusables/cli@latest add --all
```

Components are configured via `components.json`:
- Style: "new-york"
- Base color: "neutral"
- CSS variables enabled
- Aliases: @/components, @/lib, @/ui, @/hooks

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

## Platform Support

This app runs on iOS, Android, and Web. It fully supports Expo Go for quick testing on physical devices.

## Deployment

The project is configured for deployment via Expo Application Services (EAS):
- EAS Build for building native apps
- EAS Updates for OTA updates
- EAS Submit for app store submissions

## App Features & Data Models

### Core Features

**1. Habit/Goal Creation**
- Habit name (required)
- Time range options: Daily, Weekly, Monthly, or Custom
- Target frequency (e.g., "5 times per week")
- Optional: description, category/tags, start/end dates

**2. Activity Logging**
- Quick one-tap logging for habit completion
- Automatic timestamps
- Retroactive logging with custom date/time
- Optional notes per completion

**3. Visualization & Progress Tracking**
- **Dashboard View:** Today's habits, streaks, quick stats
- **Calendar View:** GitHub-style heatmap showing all habits with color intensity based on completion density
- **Habit Detail View:** Binary heatmap (completed/not completed), streak tracking, completion percentage
- **Statistics:** Overall completion rate, trends, best performing habits

### Data Models

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
  targetFrequency: number; // How many times per time range
  startDate: Date;
  endDate?: Date; // Optional for time-bound goals
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

interface LogEntry {
  id: string;
  habitId: string;
  completedAt: Date; // When the habit was actually completed
  loggedAt: Date; // When the user logged it
  notes?: string;
}
```

### MVP Scope (Phase 1)

**In Scope:**
- Create habits (name, time range, target frequency)
- Log habit completions (quick tap, timestamp)
- View today's habits on dashboard
- Calendar view with multi-tone heatmap showing all habits
- Habit detail view with binary heatmap
- Simple streak tracking

**Out of Scope for MVP:**
- Cloud sync/backup
- Social features
- Habit templates
- Advanced analytics
- Notifications/reminders
- Export data

### Design Principles

- **Simple & Fast:** Minimize taps to log a habit
- **Visual Feedback:** Clear indication of progress and completion
- **Encouraging:** Positive reinforcement for streaks and achievements
- **Flexible:** Support various habit types and tracking patterns

### Technical Requirements

- **Data Persistence:** Local storage using AsyncStorage or SQLite for offline-first functionality
- **Performance:** Instant feedback on logging, smooth animations
- **Dark Mode:** Respects system theme preference
