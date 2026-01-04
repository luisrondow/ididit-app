# IDidIt - Habit Tracker App Specification

## Overview

IDidIt is a mobile habit tracker application that helps users build and maintain positive habits through goal setting, activity logging, and visual progress tracking.

**Core Value Proposition:** Simple, flexible habit tracking with customizable time ranges and clear visual feedback on progress.

## Core Features

### 1. Habit/Goal Creation

Users can create habits with flexible configurations:

- **Habit Name** - Clear, descriptive title for the habit
- **Time Range Options:**
  - Daily
  - Weekly
  - Monthly
  - Custom time range (e.g., "every 3 days", "twice a week")
- **Target Frequency** - How many times the habit should be completed within the time range
  - Examples: "5 times per week", "once daily", "3 times per month"
- **Optional Fields:**
  - Description/notes
  - Category/tags (e.g., Health, Productivity, Personal)
  - Start date
  - End date (for time-bound goals)

### 2. Activity Logging

Users can quickly log when they complete a habit:

- **Quick Log** - One-tap logging for habit completion
- **Timestamp** - Automatically records when the activity was logged
- **Retroactive Logging** - Ability to log past completions with custom date/time
- **Log Details (Optional):**
  - Notes about the completion

### 3. Visualization & Progress Tracking

Users can view their progress through multiple visualization methods:

- **Dashboard View:**
  - Today's habits with completion status
  - Current streak information
  - Quick stats (completion rate, total completions)

- **Calendar View:**
  - GitHub-style contribution heatmap showing all habits
  - Different color intensities represent completion density:
    - Lighter tones = fewer habits completed that day
    - Darker tones = more habits completed that day
  - Visual indication of potential vs. actual completions
  - Ability to see historical data

- **Habit Detail View:**
  - GitHub-style contribution heatmap (binary for single habit)
    - Shows completed days vs. non-completed days
    - Simple two-tone visualization (completed/not completed)
  - Streak tracking (current streak, longest streak)
  - Completion percentage for current time range
  - Historical completion log

- **Statistics:**
  - Overall completion rate
  - Best performing habits
  - Trends over time (improving/declining)

## User Flows

### Creating a New Habit

1. User taps "Add Habit" button
2. Enters habit name (required)
3. Selects time range (daily/weekly/monthly/custom)
4. Sets target frequency
5. (Optional) Adds category, description, dates
6. Saves habit
7. Habit appears in dashboard

### Logging a Habit Completion

1. User sees habit in today's list
2. Taps to mark as complete
3. (Optional) Adds notes
4. Completion is recorded with timestamp
5. Visual feedback confirms logging
6. Dashboard updates with new progress

### Viewing Progress

1. User navigates to habit detail or calendar view
2. Views heatmap visualization of completion history
3. Can filter by date range or habit
4. Can see streaks and statistics

## Data Models

### Habit

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
```

### Log Entry

```typescript
interface LogEntry {
  id: string;
  habitId: string;
  completedAt: Date; // When the habit was actually completed
  loggedAt: Date; // When the user logged it
  notes?: string;
}
```

## UI/UX Requirements

### Design Principles

- **Simple & Fast** - Minimize taps to log a habit
- **Visual Feedback** - Clear indication of progress and completion
- **Encouraging** - Positive reinforcement for streaks and achievements
- **Flexible** - Support various habit types and tracking patterns

### Key Screens

1. **Dashboard/Home**
   - Today's habits grouped by category
   - Quick completion buttons
   - Summary statistics

2. **Habit Detail**
   - GitHub-style binary heatmap (completed/not completed)
   - Completion history list
   - Streak information
   - Edit/Delete options

3. **Calendar View**
   - Month view with GitHub-style contribution heatmap
   - Color intensity shows number of habits completed per day
   - Visual comparison of daily completion density

4. **Add/Edit Habit**
   - Form for creating or editing habits
   - Clear validation and feedback

5. **Statistics/Insights**
   - Overall progress metrics
   - Trends and patterns

### Heatmap Specifications

**Calendar View (All Habits):**
- Multi-tone color scale (e.g., 5 levels)
- Level 0: No habits completed (lightest/empty)
- Level 1-4: Increasing intensity based on completion percentage
- Shows aggregate of all habits for each day

**Habit Detail View (Single Habit):**
- Binary visualization
- Completed: Dark/filled
- Not completed: Light/empty
- Clean, simple GitHub contribution graph style

### Interaction Patterns

- **Swipe Actions** - Quick edit/delete/log from lists
- **Long Press** - Access additional options
- **Pull to Refresh** - Update data on dashboard
- **Dark Mode Support** - Respects system theme preference

## Technical Requirements

### Data Persistence

- Local storage using AsyncStorage or SQLite for offline-first functionality
- All data stored locally on device
- (Future) Cloud sync for multi-device support

### Performance

- Instant feedback on habit logging
- Smooth animations and transitions
- Efficient rendering of heatmap visualizations

### Platform Support

- iOS and Android native apps
- (Future) Web version for desktop access

## MVP Scope

**Phase 1 - Core Functionality:**
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
- Advanced analytics beyond basic stats
- Notifications/reminders
- Export data

## Future Enhancements

- **Reminders/Notifications** - Push notifications for habit reminders
- **Habit Templates** - Pre-configured common habits
- **Social Features** - Share progress, accountability partners
- **Advanced Analytics** - Detailed insights and correlations
- **Widgets** - Home screen widgets for quick logging
- **Export/Import** - Backup and restore data
- **Customization** - Themes, icons, colors for habits
- **Goal Milestones** - Achievements and badges
- **Habit Chains** - Create habit dependencies or routines
