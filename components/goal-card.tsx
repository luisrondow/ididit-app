// Goal card component for displaying a single goal

import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  ArchiveRestore,
  Check,
  Flame,
  Target,
  Clock,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import type { Goal, FiniteGoalProgress } from '@/types/models';
import { useState, memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

interface GoalCardProps {
  goal: Goal;
  // For recurring goals: completions in current period
  completionCount?: number;
  currentStreak?: number;
  // For finite goals: overall progress
  finiteProgress?: FiniteGoalProgress;
  onDelete?: (id: string) => void;
  onArchive?: (id: string, isArchived: boolean) => void;
  onPress?: () => void;
}

export const GoalCard = memo(function GoalCard({
  goal,
  completionCount = 0,
  currentStreak = 0,
  finiteProgress,
  onDelete,
  onArchive,
  onPress,
}: GoalCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const isRecurring = goal.goalType === 'recurring';

  // Recurring goal progress
  const isRecurringCompleted = useMemo(
    () => isRecurring && completionCount >= goal.targetCount,
    [isRecurring, completionCount, goal.targetCount]
  );
  const recurringProgressPercent = useMemo(
    () => isRecurring ? Math.min(completionCount / goal.targetCount, 1) : 0,
    [isRecurring, completionCount, goal.targetCount]
  );

  // Finite goal progress
  const finiteProgressPercent = useMemo(
    () => finiteProgress?.percentage ?? 0,
    [finiteProgress]
  );
  const isFiniteCompleted = useMemo(
    () => finiteProgress?.isComplete ?? false,
    [finiteProgress]
  );

  const timeRangeLabel = useMemo(() => {
    if (!isRecurring) return null;
    if (goal.timeRange === 'custom' && goal.customTimeRange) {
      return `${goal.customTimeRange.value} ${goal.customTimeRange.unit}`;
    }
    return goal.timeRange.charAt(0).toUpperCase() + goal.timeRange.slice(1);
  }, [isRecurring, goal.timeRange, goal.customTimeRange]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    router.push({
      pathname: '/habit/[id]',
      params: { id: goal.id },
    });
  }, [router, goal.id]);

  const handleDelete = useCallback(() => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(goal.id);
    }
  }, [onDelete, goal.id]);

  const handleArchive = useCallback(() => {
    setShowMenu(false);
    if (onArchive) {
      onArchive(goal.id, !goal.isArchived);
    }
  }, [onArchive, goal.id, goal.isArchived]);

  // Render recurring goal progress ring
  const renderRecurringProgress = () => (
    <View className="relative h-10 w-10 items-center justify-center">
      {/* Background track */}
      <View className="absolute h-10 w-10 rounded-full border-[3px] border-border/40" />

      {/* Progress segments */}
      {Array.from({ length: goal.targetCount }).map((_, index) => {
        const isSegmentFilled = index < completionCount;
        const segmentAngle = 360 / goal.targetCount;
        const rotation = segmentAngle * index - 90;
        const gapAngle = goal.targetCount > 1 ? 8 : 0;

        return (
          <View
            key={index}
            className="absolute h-10 w-10"
            style={{ transform: [{ rotate: `${rotation}deg` }] }}
          >
            <View
              className={`absolute left-1/2 top-0 -ml-[1.5px] h-[11px] w-[3px] rounded-full ${
                isSegmentFilled ? 'bg-success' : 'bg-border/60'
              }`}
              style={{ transform: [{ rotate: `${gapAngle / 2}deg` }] }}
            />
          </View>
        );
      })}

      {/* Center content */}
      <View
        className={`h-6 w-6 items-center justify-center rounded-full ${
          isRecurringCompleted
            ? 'bg-success'
            : recurringProgressPercent > 0
              ? 'bg-success/15'
              : 'bg-transparent'
        }`}
      >
        {isRecurringCompleted ? (
          <Icon as={Check} className="size-3.5 text-success-foreground" />
        ) : (
          <Text
            variant="caption"
            className={`font-mono-medium ${
              recurringProgressPercent > 0 ? 'text-success' : 'text-muted-foreground'
            }`}
          >
            {completionCount}
          </Text>
        )}
      </View>
    </View>
  );

  // Render finite goal progress bar
  const renderFiniteProgress = () => (
    <View className="flex-row items-center gap-3">
      {/* Circular progress indicator */}
      <View className="relative h-10 w-10 items-center justify-center">
        <View className="absolute h-10 w-10 rounded-full border-[3px] border-border/40" />
        <View
          className="absolute h-10 w-10 rounded-full border-[3px] border-primary"
          style={{
            borderRightColor: 'transparent',
            borderBottomColor: finiteProgressPercent > 50 ? undefined : 'transparent',
            borderLeftColor: finiteProgressPercent > 75 ? undefined : 'transparent',
            transform: [{ rotate: `${(finiteProgressPercent / 100) * 360 - 90}deg` }],
          }}
        />
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            isFiniteCompleted ? 'bg-success' : 'bg-primary/15'
          }`}
        >
          {isFiniteCompleted ? (
            <Icon as={Check} className="size-3.5 text-success-foreground" />
          ) : (
            <Text variant="caption" className="font-mono-medium text-primary">
              {finiteProgressPercent}%
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <View className="mb-3 rounded-lg border border-border bg-card p-5">
        {/* Header row with name and progress */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text variant="h3" className="mr-3 flex-1 text-foreground" numberOfLines={1}>
            {goal.name}
          </Text>

          {/* Progress indicator based on goal type */}
          <View className="flex-row items-center gap-2.5">
            {isRecurring ? renderRecurringProgress() : renderFiniteProgress()}
          </View>

          <View className="relative ml-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onPress={() => setShowMenu(!showMenu)}
            >
              <Icon as={MoreVertical} className="size-4 text-muted-foreground" />
            </Button>
            {showMenu && (
              <View className="absolute right-0 top-10 z-50 min-w-[140px] rounded-lg border border-border bg-card shadow-lg">
                <Pressable
                  onPress={handleEdit}
                  className="flex-row items-center gap-3 px-4 py-3 active:bg-accent"
                >
                  <Icon as={Edit} className="size-4 text-foreground" />
                  <Text variant="body" className="text-foreground">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={handleArchive}
                  className="flex-row items-center gap-3 px-4 py-3 active:bg-accent"
                >
                  <Icon
                    as={goal.isArchived ? ArchiveRestore : Archive}
                    className="size-4 text-foreground"
                  />
                  <Text variant="body" className="text-foreground">
                    {goal.isArchived ? 'Unarchive' : 'Archive'}
                  </Text>
                </Pressable>
                <View className="h-px bg-border" />
                <Pressable
                  onPress={handleDelete}
                  className="flex-row items-center gap-3 px-4 py-3 active:bg-accent"
                >
                  <Icon as={Trash2} className="size-4 text-destructive" />
                  <Text variant="body" className="text-destructive">Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {goal.description && (
          <Text variant="body" className="mb-3 text-muted-foreground" numberOfLines={2}>
            {goal.description}
          </Text>
        )}

        {/* Finite goal: Progress bar */}
        {!isRecurring && finiteProgress && (
          <View className="mb-3">
            <View className="h-2 w-full rounded-full bg-border/40 overflow-hidden">
              <View
                className={`h-full rounded-full ${isFiniteCompleted ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${finiteProgressPercent}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1.5">
              <Text variant="caption" className="text-muted-foreground">
                {finiteProgress.completed}/{finiteProgress.target} complete
              </Text>
              {!isFiniteCompleted && finiteProgress.daysRemaining > 0 && (
                <Text variant="caption" className="text-muted-foreground">
                  {finiteProgress.daysRemaining} days left
                </Text>
              )}
              {finiteProgress.isOverdue && (
                <Text variant="caption" className="text-destructive">
                  Overdue
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Tags row */}
        <View className="flex-row flex-wrap items-center gap-2">
          {/* Goal type indicator */}
          <View className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
            isRecurring ? 'border-border' : 'border-primary/30 bg-primary/5'
          }`}>
            <Icon
              as={isRecurring ? Flame : Target}
              className={`size-3 ${isRecurring ? 'text-muted-foreground' : 'text-primary'}`}
            />
            <Text
              variant="caption"
              className={`font-sans-medium ${isRecurring ? 'text-muted-foreground' : 'text-primary'}`}
            >
              {isRecurring ? 'Habit' : 'Milestone'}
            </Text>
          </View>

          {/* Time range (recurring only) */}
          {isRecurring && timeRangeLabel && (
            <View className="rounded-full border border-border px-3 py-1.5">
              <Text variant="caption" className="font-sans-medium text-foreground">
                {timeRangeLabel}
              </Text>
            </View>
          )}

          {/* Target count (hidden for daily habits with target of 1) */}
          {!(isRecurring && goal.timeRange === 'daily' && goal.targetCount === 1) && (
            <View className="rounded-full border border-border px-3 py-1.5">
              <Text variant="caption" className="font-mono text-muted-foreground">
                {goal.targetCount}x{isRecurring ? '' : ' total'}
              </Text>
            </View>
          )}

          {/* Streak (recurring only) */}
          {isRecurring && currentStreak > 0 && (
            <View className="flex-row items-center gap-1.5 rounded-full border border-streak/30 bg-streak/10 px-3 py-1.5">
              <Icon as={Flame} className="size-3 text-streak" />
              <Text variant="caption" className="font-mono-medium text-streak">
                {currentStreak}
              </Text>
            </View>
          )}

          {/* Days remaining (finite only) */}
          {!isRecurring && finiteProgress && !finiteProgress.isComplete && finiteProgress.daysRemaining > 0 && finiteProgress.daysRemaining <= 7 && (
            <View className="flex-row items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5">
              <Icon as={Clock} className="size-3 text-warning" />
              <Text variant="caption" className="font-mono-medium text-warning">
                {finiteProgress.daysRemaining}d
              </Text>
            </View>
          )}

          {goal.category && (
            <View className="rounded-full border border-border px-3 py-1.5">
              <Text variant="caption" className="text-muted-foreground">
                {goal.category}
              </Text>
            </View>
          )}

          {goal.isArchived && (
            <View className="rounded-full border border-border px-3 py-1.5">
              <Text variant="caption" className="text-muted-foreground">
                Archived
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

// Legacy alias for backwards compatibility
export const HabitCard = GoalCard;

