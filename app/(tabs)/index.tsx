// Dashboard screen - Today's habits and quick stats

import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitsStore } from '@/lib/store/habits-store';
import { useLogsStore } from '@/lib/store/logs-store';
import { useEffect, useState } from 'react';
import { HabitCard } from '@/components/habit-card';
import { useRouter } from 'expo-router';
import type { LogEntry } from '@/types/models';
import { getCompletionCountForDate, getLogEntriesByHabitId } from '@/lib/repositories/log-repository';
import { startOfDay, endOfDay } from '@/lib/utils/date-helpers';
import { calculateStreak } from '@/lib/utils/streak-calculator';

export default function DashboardScreen() {
  const router = useRouter();
  const { habits, loadActiveHabits, removeHabit, toggleArchive, isLoading } = useHabitsStore();
  const { addLog } = useLogsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      loadCompletionCounts();
      loadStreaks();
    }
  }, [habits]);

  const loadHabits = async () => {
    await loadActiveHabits();
  };

  const loadCompletionCounts = async () => {
    const today = new Date().toISOString();
    const counts: Record<string, number> = {};

    for (const habit of habits) {
      const count = await getCompletionCountForDate(habit.id, today);
      counts[habit.id] = count;
    }

    setCompletionCounts(counts);
  };

  const loadStreaks = async () => {
    const streakData: Record<string, number> = {};

    for (const habit of habits) {
      const logs = await getLogEntriesByHabitId(habit.id);
      const streakInfo = calculateStreak(habit, logs);
      streakData[habit.id] = streakInfo.currentStreak;
    }

    setStreaks(streakData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const handleLog = async (habitId: string) => {
    const now = new Date().toISOString();
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      habitId,
      completedAt: now,
      loggedAt: now,
    };

    try {
      await addLog(newLog);
      // Update completion count and streaks for this habit
      await loadCompletionCounts();
      await loadStreaks();
    } catch (error) {
      Alert.alert('Error', 'Failed to log completion');
      console.error('Error logging completion:', error);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit? This will also delete all associated log entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeHabit(id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete habit');
            console.error('Error deleting habit:', error);
          }
        },
      },
    ]);
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      await toggleArchive(id, isArchived);
    } catch (error) {
      Alert.alert('Error', 'Failed to archive habit');
      console.error('Error archiving habit:', error);
    }
  };

  const handleCreateHabit = () => {
    router.push('/habit/new');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader
        title="Dashboard"
        subtitle={today}
        rightAction={
          <Button size="icon" variant="ghost" className="rounded-full" onPress={handleCreateHabit}>
            <Icon as={Plus} className="size-5" />
          </Button>
        }
      />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4">
          {isLoading && habits.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground">Loading habits...</Text>
            </View>
          ) : habits.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground text-center mb-4">
                No habits yet. Tap the + button to create your first habit!
              </Text>
              <Button onPress={handleCreateHabit}>
                <Icon as={Plus} className="size-4 mr-2" />
                <Text>Create Habit</Text>
              </Button>
            </View>
          ) : (
            <View>
              <Text className="text-sm text-muted-foreground mb-3">
                {habits.length} active {habits.length === 1 ? 'habit' : 'habits'}
              </Text>
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completionCount={completionCounts[habit.id] ?? 0}
                  currentStreak={streaks[habit.id] ?? 0}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onLog={handleLog}
                  onPress={() => {
                    router.push({
                      pathname: '/habit/detail/[id]',
                      params: { id: habit.id },
                    });
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
