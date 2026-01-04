// Habit card component for displaying a single habit

import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { MoreVertical, Archive, Trash2, Edit, ArchiveRestore } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import type { Habit } from '@/types/models';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

interface HabitCardProps {
  habit: Habit;
  onDelete?: (id: string) => void;
  onArchive?: (id: string, isArchived: boolean) => void;
  onPress?: () => void;
}

export function HabitCard({ habit, onDelete, onArchive, onPress }: HabitCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const getTimeRangeLabel = () => {
    if (habit.timeRange === 'custom' && habit.customTimeRange) {
      return `${habit.customTimeRange.value} ${habit.customTimeRange.unit}`;
    }
    return habit.timeRange.charAt(0).toUpperCase() + habit.timeRange.slice(1);
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push({
      pathname: '/habit/[id]',
      params: { id: habit.id },
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(habit.id);
    }
  };

  const handleArchive = () => {
    setShowMenu(false);
    if (onArchive) {
      onArchive(habit.id, !habit.isArchived);
    }
  };

  return (
    <Pressable onPress={onPress}>
      <View className="bg-card border border-border rounded-lg p-4 mb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{habit.name}</Text>
            {habit.description && (
              <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                {habit.description}
              </Text>
            )}
            <View className="flex-row items-center gap-3 mt-2">
              <View className="bg-primary/10 px-2 py-1 rounded">
                <Text className="text-xs text-primary font-medium">{getTimeRangeLabel()}</Text>
              </View>
              <View className="bg-secondary px-2 py-1 rounded">
                <Text className="text-xs text-secondary-foreground font-medium">
                  {habit.targetFrequency}x per period
                </Text>
              </View>
              {habit.category && (
                <View className="bg-accent px-2 py-1 rounded">
                  <Text className="text-xs text-accent-foreground font-medium">
                    {habit.category}
                  </Text>
                </View>
              )}
              {habit.isArchived && (
                <View className="bg-muted px-2 py-1 rounded">
                  <Text className="text-xs text-muted-foreground font-medium">Archived</Text>
                </View>
              )}
            </View>
          </View>
          <View className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onPress={() => setShowMenu(!showMenu)}>
              <Icon as={MoreVertical} className="size-4" />
            </Button>
            {showMenu && (
              <View className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg min-w-[140px] z-50">
                <Pressable
                  onPress={handleEdit}
                  className="flex-row items-center gap-2 px-3 py-2 active:bg-accent">
                  <Icon as={Edit} className="size-4 text-foreground" />
                  <Text className="text-sm text-foreground">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={handleArchive}
                  className="flex-row items-center gap-2 px-3 py-2 active:bg-accent">
                  <Icon
                    as={habit.isArchived ? ArchiveRestore : Archive}
                    className="size-4 text-foreground"
                  />
                  <Text className="text-sm text-foreground">
                    {habit.isArchived ? 'Unarchive' : 'Archive'}
                  </Text>
                </Pressable>
                <View className="h-px bg-border" />
                <Pressable
                  onPress={handleDelete}
                  className="flex-row items-center gap-2 px-3 py-2 active:bg-accent">
                  <Icon as={Trash2} className="size-4 text-destructive" />
                  <Text className="text-sm text-destructive">Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
