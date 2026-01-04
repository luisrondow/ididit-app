// Dashboard screen - Today's habits and quick stats

import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { Plus, TrendingUp, Flame, Target } from 'lucide-react-native';
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
        {/* Hero Section */}
        {!isLoading && habits.length > 0 && (() => {
          const totalHabits = habits.length;
          const completedCount = habits.filter(habit => {
            const count = completionCounts[habit.id] ?? 0;
            return count >= habit.targetFrequency;
          }).length;
          const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
          const activeStreaks = Object.values(streaks).filter(s => s > 0).length;

          const getMessage = () => {
            if (percentage === 100) return "Perfect day! All habits completed! 🎉";
            if (percentage >= 75) return "Great progress! You're almost there! 🌟";
            if (percentage >= 50) return "Keep going! You're halfway there! 💪";
            if (percentage >= 25) return "Good start! Keep the momentum! 🚀";
            return "Let's make today count! ✨";
          };

          return (
            <View className="px-4 pt-4 pb-2">
              <View className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-foreground mb-1">Today's Progress</Text>
                    <Text className="text-sm text-muted-foreground">{getMessage()}</Text>
                  </View>
                  <View className="bg-primary/10 rounded-full p-3">
                    <Icon as={Target} className="size-8 text-primary" />
                  </View>
                </View>

                <View className="flex-row items-end mb-4">
                  <Text className="text-5xl font-bold text-primary">{percentage}</Text>
                  <Text className="text-2xl font-semibold text-primary mb-1">%</Text>
                  <Text className="text-sm text-muted-foreground ml-2 mb-2">
                    {completedCount} of {totalHabits} completed
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-card/50 border border-border/50 rounded-lg p-3 flex-row items-center gap-2">
                    <Icon as={Flame} className="size-5 text-streak" />
                    <View>
                      <Text className="text-xs text-muted-foreground">Active Streaks</Text>
                      <Text className="text-lg font-bold text-foreground">{activeStreaks}</Text>
                    </View>
                  </View>
                  <View className="flex-1 bg-card/50 border border-border/50 rounded-lg p-3 flex-row items-center gap-2">
                    <Icon as={TrendingUp} className="size-5 text-success" />
                    <View>
                      <Text className="text-xs text-muted-foreground">Total Habits</Text>
                      <Text className="text-lg font-bold text-foreground">{totalHabits}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        <View className="p-4">
          {isLoading && habits.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground">Loading habits...</Text>
            </View>
          ) : habits.length === 0 ? (
            <View className="bg-card border border-border rounded-2xl p-8 items-center justify-center min-h-[300px]">
              <View className="bg-primary/10 rounded-full p-4 mb-4">
                <Icon as={Target} className="size-12 text-primary" />
              </View>
              <Text className="text-xl font-bold text-foreground text-center mb-2">
                Start Your Journey
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
                Build better habits, one day at a time. Create your first habit to get started!
              </Text>
              <Button onPress={handleCreateHabit} className="min-w-[160px]">
                <Icon as={Plus} className="size-5 mr-2" />
                <Text>Create Your First Habit</Text>
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
