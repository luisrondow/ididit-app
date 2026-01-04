// Habit card component for displaying a single habit

import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { MoreVertical, Archive, Trash2, Edit, ArchiveRestore, Check, Flame } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import type { Habit } from '@/types/models';
import { useState, memo, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

interface HabitCardProps {
  habit: Habit;
  completionCount?: number;
  currentStreak?: number;
  onDelete?: (id: string) => void;
  onArchive?: (id: string, isArchived: boolean) => void;
  onLog?: (habitId: string) => void;
  onPress?: () => void;
}

export const HabitCard = memo(function HabitCard({ habit, completionCount = 0, currentStreak = 0, onDelete, onArchive, onLog, onPress }: HabitCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = useMemo(() => completionCount >= habit.targetFrequency, [completionCount, habit.targetFrequency]);
  const progressText = useMemo(() => `${completionCount}/${habit.targetFrequency}`, [completionCount, habit.targetFrequency]);

  const handleLog = useCallback((e: any) => {
    e.stopPropagation();
    if (onLog) {
      onLog(habit.id);
    }
  }, [onLog, habit.id]);

  const timeRangeLabel = useMemo(() => {
    if (habit.timeRange === 'custom' && habit.customTimeRange) {
      return `${habit.customTimeRange.value} ${habit.customTimeRange.unit}`;
    }
    return habit.timeRange.charAt(0).toUpperCase() + habit.timeRange.slice(1);
  }, [habit.timeRange, habit.customTimeRange]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    router.push({
      pathname: '/habit/[id]',
      params: { id: habit.id },
    });
  }, [router, habit.id]);

  const handleDelete = useCallback(() => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(habit.id);
    }
  }, [onDelete, habit.id]);

  const handleArchive = useCallback(() => {
    setShowMenu(false);
    if (onArchive) {
      onArchive(habit.id, !habit.isArchived);
    }
  }, [onArchive, habit.id, habit.isArchived]);

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <View className="bg-card border border-border rounded-lg p-5 mb-3">
        {/* Header row with name and completion */}
        <View className="flex-row items-center justify-between mb-3">
          <Text variant="h3" className="text-foreground flex-1 mr-3" numberOfLines={1}>
            {habit.name}
          </Text>
          
          {onLog && (
            <View className="flex-row items-center gap-3">
              <Text variant="mono" className={isCompleted ? 'text-success' : 'text-muted-foreground'}>
                {progressText}
              </Text>
              <Pressable 
                onPress={handleLog}
                className="active:scale-105"
              >
                <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                  isCompleted 
                    ? 'bg-success border-success' 
                    : 'border-border bg-transparent'
                }`}>
                  {isCompleted && (
                    <Icon as={Check} className="size-4 text-success-foreground" />
                  )}
                </View>
              </Pressable>
            </View>
          )}
          
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
              <View className="absolute right-0 top-10 bg-card border border-border rounded-lg min-w-[140px] z-50">
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
                    as={habit.isArchived ? ArchiveRestore : Archive}
                    className="size-4 text-foreground"
                  />
                  <Text variant="body" className="text-foreground">
                    {habit.isArchived ? 'Unarchive' : 'Archive'}
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
        {habit.description && (
          <Text variant="body" className="text-muted-foreground mb-3" numberOfLines={2}>
            {habit.description}
          </Text>
        )}

        {/* Tags row */}
        <View className="flex-row items-center flex-wrap gap-2">
          <View className="border border-border px-3 py-1.5 rounded-full">
            <Text variant="caption" className="text-foreground font-sans-medium">
              {timeRangeLabel}
            </Text>
          </View>
          
          <View className="border border-border px-3 py-1.5 rounded-full">
            <Text variant="caption" className="text-muted-foreground font-mono">
              {habit.targetFrequency}x
            </Text>
          </View>
          
          {currentStreak > 0 && (
            <View className="flex-row items-center gap-1.5 border border-streak/30 bg-streak/10 px-3 py-1.5 rounded-full">
              <Icon as={Flame} className="size-3 text-streak" />
              <Text variant="caption" className="text-streak font-mono-medium">
                {currentStreak}
              </Text>
            </View>
          )}
          
          {habit.category && (
            <View className="border border-border px-3 py-1.5 rounded-full">
              <Text variant="caption" className="text-muted-foreground">
                {habit.category}
              </Text>
            </View>
          )}
          
          {habit.isArchived && (
            <View className="border border-border px-3 py-1.5 rounded-full">
              <Text variant="caption" className="text-muted-foreground">Archived</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});
