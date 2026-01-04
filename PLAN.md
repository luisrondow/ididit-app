# IDidIt Habit Tracker - Implementation Plan

## Overview
Build a full MVP habit tracker app with:
- Habit creation/editing (name, time range, target frequency, freeform category)
- One-tap logging + retroactive logging
- Dashboard with today's habits
- Calendar view (current month heatmap - multi-tone)
- Habit detail view (user-selectable date range: This Year / Current Month / Since Start)
- GitHub-style heatmaps (binary for single habit, multi-tone for all habits)
- Streak tracking

## Technical Architecture

### Data Layer
- **Storage**: SQLite via `expo-sqlite` (better for relational data, complex queries, heatmap aggregations)
- **State Management**: Zustand (lightweight, performant, no provider hell)
- **Date Handling**: `date-fns` (tree-shakable, TypeScript support)

### Data Models
```typescript
// types/models.ts
interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string; // Freeform text
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  customTimeRange?: { value: number; unit: 'days' | 'weeks' | 'months' };
  targetFrequency: number;
  startDate: string; // ISO 8601
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface LogEntry {
  id: string;
  habitId: string;
  completedAt: string; // ISO 8601
  loggedAt: string;
  notes?: string;
}
```

### Routing Structure
```
app/
├── (tabs)/                    # Tab navigation
│   ├── _layout.tsx           # Bottom tabs
│   ├── index.tsx             # Dashboard
│   ├── calendar.tsx          # Calendar view (current month heatmap)
│   └── stats.tsx             # Statistics
├── habit/
│   ├── [id].tsx              # Habit detail (selectable date range)
│   ├── new.tsx               # Create habit
│   └── edit/[id].tsx         # Edit habit
└── log/
    └── [habitId].tsx         # Retroactive logging
```

## Implementation Phases

### Phase 1: Foundation (Days 1-3)
**Goal**: Set up data infrastructure

**Install dependencies:**
```bash
npm install expo-sqlite zustand date-fns
npx @react-native-reusables/cli add card input label textarea badge separator switch dialog alert-dialog dropdown-menu
```

**Create:**
- `types/models.ts` - TypeScript interfaces
- `lib/db/schema.ts` - SQLite schema
- `lib/db/init.ts` - Database initialization
- `lib/repositories/habit-repository.ts` - Habit CRUD operations
- `lib/repositories/log-repository.ts` - Log CRUD operations
- `lib/repositories/stats-repository.ts` - Aggregation queries
- `lib/store/habits-store.ts` - Zustand store for habits
- `lib/store/logs-store.ts` - Zustand store for logs
- `lib/utils/date-helpers.ts` - Date utilities (wrappers around date-fns)
- `lib/utils/validators.ts` - Form and data validation
- `lib/utils/streak-calculator.ts` - Streak calculation logic
- `lib/utils/completion-calculator.ts` - Completion percentage logic

**Validation**: Can create/read/update/delete habits and logs in database

---

### Phase 2: Navigation & Basic UI (Day 4)
**Goal**: Set up screen structure

**Create:**
- `app/(tabs)/_layout.tsx` - Bottom tab navigation
- `app/(tabs)/index.tsx` - Dashboard (placeholder)
- `app/(tabs)/calendar.tsx` - Calendar (placeholder)
- `app/(tabs)/stats.tsx` - Stats (placeholder)
- `app/habit/[id].tsx` - Habit detail (placeholder)
- `app/habit/new.tsx` - Create habit screen
- `app/habit/edit/[id].tsx` - Edit habit screen
- `components/shared/empty-state.tsx` - Empty state component

**Validation**: Can navigate between all screens

---

### Phase 3: Habit Management (Days 5-7)
**Goal**: Full habit CRUD

**Create:**
- `components/shared/habit-form.tsx` - Reusable form component
  - Name input (required)
  - Description textarea (optional)
  - Category input (freeform text, optional)
  - Time range select (daily/weekly/monthly/custom)
  - Custom time range picker (if custom selected)
  - Target frequency input
  - Start/end date pickers
  - Validation
- `components/shared/habit-card.tsx` - Habit display card
- `components/shared/habit-list.tsx` - List of habit cards

**Implement:**
- `app/habit/new.tsx` - Full creation flow
- `app/habit/edit/[id].tsx` - Full editing flow with delete
- `app/(tabs)/index.tsx` - Display habits list

**Validation**: Can create, edit, delete habits; see them on dashboard

---

### Phase 4: Logging (Days 8-10)
**Goal**: Enable habit completion logging

**Create:**
- `components/shared/habit-quick-log-button.tsx` - One-tap completion button
- `components/shared/completion-indicator.tsx` - Visual completion status
- `components/shared/completion-log-item.tsx` - Single log entry display
- `components/shared/completion-log-list.tsx` - List of log entries
- `app/log/[habitId].tsx` - Retroactive logging screen

**Implement:**
- Quick log button on dashboard habit cards
- Real-time UI updates after logging
- Retroactive logging with date/time picker
- Notes field on logs
- Completion history in habit detail

**Validation**: Can log today's completions; can log past completions; cannot log future dates

---

### Phase 5: Streaks (Days 11-12)
**Goal**: Calculate and display streaks

**Create:**
- `components/shared/streak-badge.tsx` - Streak display component
- Streak calculation logic in `lib/utils/streak-calculator.ts`
  - Current streak algorithm
  - Longest streak algorithm
  - Handle daily/weekly/monthly/custom ranges

**Implement:**
- Show current streak on habit cards
- Show current + longest streak in habit detail
- Update streaks when new completions logged

**Validation**: Streaks calculate correctly for all time ranges

---

### Phase 6: Habit Detail View (Days 13-15)
**Goal**: Complete single habit visualization

**Create:**
- `components/shared/heatmap-binary.tsx` - Binary heatmap (completed/not completed)
- `components/shared/heatmap-cell.tsx` - Individual heatmap cell
- `components/shared/habit-stats-summary.tsx` - Stats widget
- `components/shared/date-range-selector.tsx` - Selector for "This Year / Current Month / Since Start"

**Implement:**
- `app/habit/[id].tsx` - Full habit detail screen
  - Header with name, category, edit/delete
  - Date range selector (This Year / Current Month / Since Start)
  - Binary heatmap based on selected range
  - Streak info (current, longest)
  - Completion percentage for current time range
  - Scrollable completion history

**Heatmap specs:**
- Grid: 7 columns (days) × variable rows (weeks in range)
- Two tones: completed (dark) vs not completed (light)
- Cell size: ~12-15px with 2-3px gap
- Future dates: dimmed
- Build from scratch using View/Pressable

**Validation**: Heatmap renders correctly; date range selector updates heatmap

---

### Phase 7: Calendar View (Days 16-18)
**Goal**: Multi-habit monthly heatmap

**Create:**
- `components/shared/heatmap-calendar.tsx` - Multi-tone heatmap
- `components/shared/heatmap-legend.tsx` - Intensity scale legend
- `components/shared/month-navigator.tsx` - Previous/next month controls

**Implement:**
- `app/(tabs)/calendar.tsx` - Calendar screen
  - Month/year header
  - Previous/next month navigation
  - Multi-tone heatmap (5 intensity levels)
  - Legend
  - Tap cell to see day details

**Heatmap specs:**
- Shows current month only (can navigate to other months)
- Grid: 7 columns × ~5 rows (weeks in month)
- Five intensity levels based on completion percentage:
  - Level 0: No habits completed (lightest)
  - Level 1: 1-25% (light)
  - Level 2: 26-50% (medium)
  - Level 3: 51-75% (medium-dark)
  - Level 4: 76-100% (darkest)
- Intensity = completed / possible habits for that day

**Add to theme:**
```css
/* global.css */
--heatmap-0: 0 0% 96.1%; /* light mode level 0 */
--heatmap-1: 0 0% 75%;
--heatmap-2: 0 0% 55%;
--heatmap-3: 0 0% 35%;
--heatmap-4: 0 0% 9%;
/* Add dark mode equivalents */
```

**Validation**: Calendar shows current month; intensity levels accurate; navigation works

---

### Phase 8: Statistics (Days 19-20)
**Goal**: Overall progress insights

**Create:**
- `components/shared/progress-ring.tsx` - Circular progress indicator
- `components/shared/completion-rate-bar.tsx` - Progress bar

**Implement:**
- `app/(tabs)/stats.tsx` - Statistics screen
  - Overall completion rate
  - Total habits tracked
  - Total completions (this week/month/all time)
  - Best performing habits list
  - Habits needing attention
  - Longest streaks

**Validation**: All stats calculate correctly

---

### Phase 9: Polish (Days 21-23)
**Goal**: Improve UX

**Tasks:**
- Add loading states (skeleton screens)
- Error handling (toast notifications)
- Animations (completion button, screen transitions)
- Optimize performance (memoization, query optimization)
- Accessibility (labels, touch targets, contrast)
- Dark mode refinement
- Pull to refresh on dashboard

**Validation**: App feels responsive; works well in both themes

---

### Phase 10: Testing & Bug Fixes (Days 24-25)
**Goal**: Ensure stability

**Tasks:**
- Manual testing of all flows
- Test edge cases (new habits, gaps in streaks, custom time ranges)
- Test on iOS and Android
- Fix identified bugs
- Final polish

**Validation**: No critical bugs; ready for use

## Critical Files

### New Files to Create

**Types:**
- `types/models.ts`

**Database:**
- `lib/db/schema.ts`
- `lib/db/init.ts`
- `lib/repositories/habit-repository.ts`
- `lib/repositories/log-repository.ts`
- `lib/repositories/stats-repository.ts`

**State:**
- `lib/store/habits-store.ts`
- `lib/store/logs-store.ts`
- `lib/store/ui-store.ts`

**Utils:**
- `lib/utils/date-helpers.ts`
- `lib/utils/validators.ts`
- `lib/utils/streak-calculator.ts`
- `lib/utils/completion-calculator.ts`

**Screens:**
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx` (dashboard)
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/stats.tsx`
- `app/habit/[id].tsx` (detail)
- `app/habit/new.tsx`
- `app/habit/edit/[id].tsx`
- `app/log/[habitId].tsx`

**Shared Components:**
- `components/shared/habit-form.tsx`
- `components/shared/habit-card.tsx`
- `components/shared/habit-list.tsx`
- `components/shared/habit-quick-log-button.tsx`
- `components/shared/heatmap-binary.tsx`
- `components/shared/heatmap-calendar.tsx`
- `components/shared/heatmap-cell.tsx`
- `components/shared/heatmap-legend.tsx`
- `components/shared/date-range-selector.tsx`
- `components/shared/streak-badge.tsx`
- `components/shared/habit-stats-summary.tsx`
- `components/shared/completion-log-item.tsx`
- `components/shared/completion-log-list.tsx`
- `components/shared/empty-state.tsx`
- `components/shared/progress-ring.tsx`
- `components/shared/completion-rate-bar.tsx`

### Files to Modify

**Theme:**
- `global.css` - Add heatmap color variables
- `tailwind.config.js` - Add heatmap colors to theme

**Layout:**
- `app/_layout.tsx` - May need to wrap with store providers

## Key Decisions

1. **SQLite over AsyncStorage**: Better for relational data, complex queries, and performance with large datasets
2. **Zustand over Context/Redux**: Simpler, less boilerplate, better performance
3. **date-fns**: Lightweight, tree-shakable, good TypeScript support
4. **Build heatmaps from scratch**: Full control over styling, theming, performance
5. **Freeform categories**: Simple, flexible, no constraints
6. **Calendar view shows current month**: Simpler UX, with navigation to other months
7. **Habit detail has date range selector**: Flexible visualization (This Year / Current Month / Since Start)

## Implementation Notes

- Start with Phase 1 (data layer) - solid foundation prevents refactoring
- Test each phase before moving to next
- Use existing UI components from React Native Reusables where possible
- Follow NativeWind/Tailwind patterns for consistency
- Prioritize performance (memoization, efficient queries)
- Ensure dark mode works throughout
- Build incrementally, validating at each step
