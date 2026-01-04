// Statistics screen - Overall progress and insights

import { View, ScrollView, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useHabitsStore } from '@/lib/store/habits-store';
import { getOverallStats } from '@/lib/repositories/stats-repository';
import { getLogEntriesByHabitId } from '@/lib/repositories/log-repository';
import { calculateStreak } from '@/lib/utils/streak-calculator';
import { TrendingUp, Target, Flame, CheckCircle2, Calendar, Award } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function StatisticsScreen() {
  const { habits, loadActiveHabits } = useHabitsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Overall stats
  const [totalHabits, setTotalHabits] = useState(0);
  const [activeHabits, setActiveHabits] = useState(0);
  const [completionsToday, setCompletionsToday] = useState(0);
  const [completionsThisWeek, setCompletionsThisWeek] = useState(0);
  const [completionsThisMonth, setCompletionsThisMonth] = useState(0);
  const [completionsAllTime, setCompletionsAllTime] = useState(0);

  // Habit-specific stats
  const [bestStreak, setBestStreak] = useState({ habitName: '', streak: 0 });
  const [mostCompleted, setMostCompleted] = useState({ habitName: '', count: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Load habits
      await loadActiveHabits();

      // Load overall stats
      const overallStats = await getOverallStats();
      setTotalHabits(overallStats.totalHabits);
      setActiveHabits(overallStats.activeHabits);
      setCompletionsToday(overallStats.totalCompletionsToday);
      setCompletionsThisWeek(overallStats.totalCompletionsThisWeek);
      setCompletionsThisMonth(overallStats.totalCompletionsThisMonth);
      setCompletionsAllTime(overallStats.totalCompletionsAllTime);

      // Find habit with best streak and most completions
      let maxStreak = 0;
      let maxStreakHabit = '';
      let maxCompletions = 0;
      let maxCompletionsHabit = '';

      for (const habit of habits) {
        const logs = await getLogEntriesByHabitId(habit.id);
        const streakInfo = calculateStreak(habit, logs);

        if (streakInfo.longestStreak > maxStreak) {
          maxStreak = streakInfo.longestStreak;
          maxStreakHabit = habit.name;
        }

        if (logs.length > maxCompletions) {
          maxCompletions = logs.length;
          maxCompletionsHabit = habit.name;
        }
      }

      setBestStreak({ habitName: maxStreakHabit, streak: maxStreak });
      setMostCompleted({ habitName: maxCompletionsHabit, count: maxCompletions });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Statistics" subtitle="Your progress overview" />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4 gap-4">
          {isLoading ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground">Loading statistics...</Text>
            </View>
          ) : (
            <>
              {/* Habits Overview */}
              <View>
                <Text className="text-lg font-semibold text-foreground mb-3">Habits Overview</Text>
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-card border border-border rounded-lg p-4 items-center">
                    <Icon as={Target} className="size-6 text-primary mb-2" />
                    <Text className="text-2xl font-bold text-foreground">{totalHabits}</Text>
                    <Text className="text-xs text-muted-foreground text-center mt-1">Total Habits</Text>
                  </View>
                  <View className="flex-1 bg-card border border-border rounded-lg p-4 items-center">
                    <Icon as={CheckCircle2} className="size-6 text-green-600 mb-2" />
                    <Text className="text-2xl font-bold text-foreground">{activeHabits}</Text>
                    <Text className="text-xs text-muted-foreground text-center mt-1">Active Habits</Text>
                  </View>
                </View>
              </View>

              {/* Completions */}
              <View>
                <Text className="text-lg font-semibold text-foreground mb-3">Completions</Text>
                <View className="gap-3">
                  <View className="bg-card border border-border rounded-lg p-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm text-muted-foreground">Today</Text>
                      <Text className="text-2xl font-bold text-foreground mt-1">{completionsToday}</Text>
                    </View>
                    <Icon as={Calendar} className="size-8 text-primary" />
                  </View>

                  <View className="bg-card border border-border rounded-lg p-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm text-muted-foreground">This Week</Text>
                      <Text className="text-2xl font-bold text-foreground mt-1">{completionsThisWeek}</Text>
                    </View>
                    <Icon as={TrendingUp} className="size-8 text-primary" />
                  </View>

                  <View className="bg-card border border-border rounded-lg p-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm text-muted-foreground">This Month</Text>
                      <Text className="text-2xl font-bold text-foreground mt-1">{completionsThisMonth}</Text>
                    </View>
                    <Icon as={CheckCircle2} className="size-8 text-green-600" />
                  </View>

                  <View className="bg-card border border-border rounded-lg p-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm text-muted-foreground">All Time</Text>
                      <Text className="text-2xl font-bold text-foreground mt-1">{completionsAllTime}</Text>
                    </View>
                    <Icon as={Award} className="size-8 text-orange-600" />
                  </View>
                </View>
              </View>

              {/* Top Performers */}
              {habits.length > 0 && (
                <View>
                  <Text className="text-lg font-semibold text-foreground mb-3">Top Performers</Text>
                  <View className="gap-3">
                    {bestStreak.streak > 0 && (
                      <View className="bg-card border border-border rounded-lg p-4">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Icon as={Flame} className="size-5 text-orange-600 dark:text-orange-400" />
                          <Text className="text-sm font-semibold text-foreground">Best Streak</Text>
                        </View>
                        <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                          {bestStreak.habitName}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                          {bestStreak.streak} {bestStreak.streak === 1 ? 'day' : 'days'}
                        </Text>
                      </View>
                    )}

                    {mostCompleted.count > 0 && (
                      <View className="bg-card border border-border rounded-lg p-4">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Icon as={Award} className="size-5 text-primary" />
                          <Text className="text-sm font-semibold text-foreground">Most Completed</Text>
                        </View>
                        <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                          {mostCompleted.habitName}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                          {mostCompleted.count} {mostCompleted.count === 1 ? 'completion' : 'completions'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Empty state */}
              {habits.length === 0 && (
                <View className="bg-card border border-border rounded-lg p-6 items-center justify-center">
                  <Text className="text-muted-foreground text-center">
                    No habits yet. Create your first habit to see statistics!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
