# IDidIt Habit Tracker - Testing Plan (Phase 10)

## Test Environment
- Platform: iOS, Android, Web
- Build: Development mode
- Database: SQLite (local)
- Features: All Phase 1-9 features

---

## 1. Habit Management Tests

### 1.1 Habit Creation
- [ ] Create habit with daily time range
- [ ] Create habit with weekly time range
- [ ] Create habit with monthly time range
- [ ] Create habit with custom time range (days)
- [ ] Create habit with custom time range (weeks)
- [ ] Create habit with custom time range (months)
- [ ] Create habit with all optional fields (description, category)
- [ ] Create habit with only required fields
- [ ] Validate required field errors (empty name)
- [ ] Validate field length limits (name >100 chars, description >500)
- [ ] Verify success toast appears
- [ ] Verify haptic feedback triggers
- [ ] Verify navigation back to dashboard
- [ ] Verify habit appears in dashboard list

### 1.2 Habit Editing
- [ ] Edit habit name
- [ ] Edit habit description
- [ ] Edit habit category
- [ ] Change time range (daily → weekly)
- [ ] Change target frequency
- [ ] Add optional fields to minimal habit
- [ ] Remove optional fields
- [ ] Validate edited fields
- [ ] Verify success toast appears
- [ ] Verify changes persist after save

### 1.3 Habit Deletion
- [ ] Delete habit from dashboard menu
- [ ] Verify confirmation alert appears
- [ ] Verify haptic feedback on delete
- [ ] Verify associated logs are deleted
- [ ] Verify habit removed from all views

### 1.4 Habit Archiving
- [ ] Archive active habit
- [ ] Unarchive archived habit
- [ ] Verify archived habits don't show in dashboard
- [ ] Verify success toast appears
- [ ] Verify haptic feedback triggers

---

## 2. Logging & Progress Tests

### 2.1 Quick Logging
- [ ] Log completion via dashboard quick log button
- [ ] Verify completion count increments
- [ ] Verify progress indicator updates (e.g., 0/5 → 1/5)
- [ ] Verify check icon changes when target reached
- [ ] Verify streak updates after logging
- [ ] Verify success toast appears
- [ ] Verify haptic feedback triggers
- [ ] Prevent logging future dates

### 2.2 Multiple Completions
- [ ] Log multiple completions for same habit (same day)
- [ ] Verify count reflects multiple logs
- [ ] Verify target completion (e.g., 5/5)
- [ ] Verify completion indicator turns green

### 2.3 Streak Calculations
- [ ] Verify current streak for consecutive days
- [ ] Verify streak resets after gap
- [ ] Verify longest streak tracking
- [ ] Test streak with daily habits
- [ ] Test streak with weekly habits
- [ ] Test streak with monthly habits
- [ ] Test streak with custom time ranges

---

## 3. Visualization Tests

### 3.1 Dashboard View
- [ ] Verify empty state message when no habits
- [ ] Verify habit cards display correctly
- [ ] Verify completion counts accurate
- [ ] Verify streak badges display
- [ ] Verify category badges display
- [ ] Verify pull-to-refresh works
- [ ] Verify skeleton loading states

### 3.2 Calendar View
- [ ] Verify heatmap renders for current month
- [ ] Verify intensity levels (0-4) calculate correctly
- [ ] Verify month navigation (previous/next)
- [ ] Verify summary stats (active days, avg completion)
- [ ] Verify empty state when no data
- [ ] Verify pull-to-refresh works
- [ ] Verify skeleton loading states

### 3.3 Habit Detail View
- [ ] Verify binary heatmap renders
- [ ] Verify heatmap shows last 3 months
- [ ] Verify completed/not completed colors
- [ ] Verify current streak displays
- [ ] Verify longest streak displays
- [ ] Verify completion percentage
- [ ] Verify total completions count
- [ ] Verify skeleton loading states

### 3.4 Statistics View
- [ ] Verify total habits count
- [ ] Verify active habits count
- [ ] Verify completions today/week/month/all-time
- [ ] Verify best streak calculation
- [ ] Verify most completed habit
- [ ] Verify empty state when no habits
- [ ] Verify pull-to-refresh works
- [ ] Verify skeleton loading states

---

## 4. Navigation Tests

### 4.1 Tab Navigation
- [ ] Navigate between Dashboard, Calendar, Statistics tabs
- [ ] Verify tab state persists
- [ ] Verify each screen loads correctly

### 4.2 Screen Transitions
- [ ] Dashboard → Create Habit
- [ ] Dashboard → Edit Habit → Back
- [ ] Dashboard → Habit Detail → Edit → Back
- [ ] Verify back navigation works
- [ ] Verify router.push works correctly

---

## 5. Data Persistence Tests

### 5.1 Database Operations
- [ ] Create habit, close app, reopen → habit persists
- [ ] Log completion, close app, reopen → log persists
- [ ] Edit habit, close app, reopen → changes persist
- [ ] Delete habit, close app, reopen → habit removed
- [ ] Verify database initialization on first launch

### 5.2 State Management
- [ ] Verify Zustand stores update correctly
- [ ] Verify habits store loads on app start
- [ ] Verify logs store loads correctly
- [ ] Verify error states handled

---

## 6. UI/UX Polish Tests

### 6.1 Toast Notifications
- [ ] Verify success toasts (green)
- [ ] Verify error toasts (red)
- [ ] Verify warning toasts (amber)
- [ ] Verify info toasts (blue)
- [ ] Verify auto-dismiss after 3 seconds
- [ ] Verify manual dismiss works
- [ ] Verify animations (slide-in, fade-out)

### 6.2 Haptic Feedback
- [ ] Verify light haptic (archive)
- [ ] Verify medium haptic (log)
- [ ] Verify heavy haptic (not used currently)
- [ ] Verify success haptic (completions)
- [ ] Verify error haptic (failures)
- [ ] Verify warning haptic (delete)

### 6.3 Loading States
- [ ] Verify skeleton screens on initial load
- [ ] Verify skeleton screens during refresh
- [ ] Verify smooth transitions from skeleton to content

### 6.4 Dark Mode
- [ ] Toggle dark mode
- [ ] Verify all screens render correctly
- [ ] Verify colors have proper contrast
- [ ] Verify icons visible in both themes
- [ ] Verify heatmap colors work in both themes
- [ ] Verify toast colors work in both themes

---

## 7. Edge Cases & Error Handling

### 7.1 Input Validation
- [ ] Submit empty habit name
- [ ] Submit name >100 characters
- [ ] Submit description >500 characters
- [ ] Submit category >50 characters
- [ ] Submit target frequency <1
- [ ] Submit target frequency >1000
- [ ] Submit invalid custom time range

### 7.2 Empty States
- [ ] Dashboard with no habits
- [ ] Calendar with no logs
- [ ] Statistics with no habits
- [ ] Habit detail with no logs

### 7.3 Streak Gaps
- [ ] Create habit, log day 1, skip day 2, log day 3 → streak = 1
- [ ] Verify longest streak maintained after gap
- [ ] Test gaps with different time ranges

### 7.4 Database Errors
- [ ] Handle failed database queries gracefully
- [ ] Verify error toasts appear
- [ ] Verify app doesn't crash on DB errors

### 7.5 Network & Performance
- [ ] Test with 50+ habits (performance)
- [ ] Test with 1000+ logs (performance)
- [ ] Verify scroll performance
- [ ] Verify animations remain smooth

---

## 8. Accessibility Tests

### 8.1 Touch Targets
- [ ] Verify all buttons have min 44x44 touch target
- [ ] Verify icons are tappable
- [ ] Verify cards are tappable

### 8.2 Labels
- [ ] Verify accessibility labels on buttons
- [ ] Verify accessibility roles set correctly

---

## 9. Cross-Platform Tests

### 9.1 iOS Specific
- [ ] Test on iOS simulator/device
- [ ] Verify safe area insets
- [ ] Verify haptics work
- [ ] Verify gestures work

### 9.2 Android Specific
- [ ] Test on Android emulator/device
- [ ] Verify safe area insets
- [ ] Verify haptics work
- [ ] Verify back button behavior

### 9.3 Web Specific
- [ ] Test in browser
- [ ] Verify responsive layout
- [ ] Verify haptics gracefully disabled
- [ ] Verify keyboard navigation

---

## 10. Critical Bug Fixes Needed

### Priority 1 (Blocking)
- None identified yet

### Priority 2 (High)
- [ ] Verify pull-to-refresh is implemented (Dashboard shows RefreshControl)
- [ ] Test all navigation paths work correctly
- [ ] Verify database migrations if schema changes

### Priority 3 (Medium)
- [ ] Optimize large list rendering with FlatList if needed
- [ ] Add error boundaries for crash prevention

### Priority 4 (Low/Polish)
- [ ] Add loading state to create/edit habit screens
- [ ] Consider adding undo for delete actions
- [ ] Consider adding search/filter for habits

---

## Test Execution Summary

**Date**: [To be filled during testing]
**Tester**: [To be filled]
**Build**: Development
**Status**: In Progress

### Critical Issues Found: 0
### High Priority Issues: 0
### Medium Priority Issues: 0
### Low Priority Issues: 0

---

## Sign-off

- [ ] All critical flows tested
- [ ] All edge cases handled
- [ ] No blocking bugs
- [ ] App ready for production use
