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
import { TrendingUp, Target, Flame, Check, Calendar, Award } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatisticsScreen() {
  const { habits, loadActiveHabits } = useHabitsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [totalHabits, setTotalHabits] = useState(0);
  const [activeHabits, setActiveHabits] = useState(0);
  const [completionsToday, setCompletionsToday] = useState(0);
  const [completionsThisWeek, setCompletionsThisWeek] = useState(0);
  const [completionsThisMonth, setCompletionsThisMonth] = useState(0);
  const [completionsAllTime, setCompletionsAllTime] = useState(0);

  const [bestStreak, setBestStreak] = useState({ habitName: '', streak: 0 });
  const [mostCompleted, setMostCompleted] = useState({ habitName: '', count: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      await loadActiveHabits();

      const overallStats = await getOverallStats();
      setTotalHabits(overallStats.totalHabits);
      setActiveHabits(overallStats.activeHabits);
      setCompletionsToday(overallStats.totalCompletionsToday);
      setCompletionsThisWeek(overallStats.totalCompletionsThisWeek);
      setCompletionsThisMonth(overallStats.totalCompletionsThisMonth);
      setCompletionsAllTime(overallStats.totalCompletionsAllTime);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5 gap-5">
          {isLoading ? (
            <View className="gap-4">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-card border border-border rounded-lg p-5 gap-3 items-center">
                  <Skeleton width={32} height={32} rounded="full" />
                  <Skeleton width={60} height={32} />
                  <Skeleton width={80} height={14} />
                </View>
                <View className="flex-1 bg-card border border-border rounded-lg p-5 gap-3 items-center">
                  <Skeleton width={32} height={32} rounded="full" />
                  <Skeleton width={60} height={32} />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
              <View className="bg-card border border-border rounded-lg p-5 gap-3">
                <Skeleton width={120} height={20} />
                <Skeleton width="100%" height={60} />
              </View>
            </View>
          ) : (
            <>
              {/* Habits Overview Grid */}
              <View>
                <Text variant="h4" className="text-foreground mb-4">Overview</Text>
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                    <Icon as={Target} className="size-6 text-foreground mb-3" />
                    <Text variant="mono-xl" className="text-foreground">{totalHabits}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Total</Text>
                  </View>
                  <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                    <Icon as={Check} className="size-6 text-success mb-3" />
                    <Text variant="mono-xl" className="text-foreground">{activeHabits}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Active</Text>
                  </View>
                </View>
              </View>

              {/* Completions */}
              <View>
                <Text variant="h4" className="text-foreground mb-4">Completions</Text>
                <View className="bg-card border border-border rounded-lg">
                  {/* Today */}
                  <View className="p-5 flex-row items-center justify-between border-b border-border">
                    <View className="flex-row items-center gap-3">
                      <Icon as={Calendar} className="size-5 text-muted-foreground" />
                      <Text variant="body" className="text-foreground">Today</Text>
                    </View>
                    <Text variant="mono-lg" className="text-foreground">{completionsToday}</Text>
                  </View>

                  {/* This Week */}
                  <View className="p-5 flex-row items-center justify-between border-b border-border">
                    <View className="flex-row items-center gap-3">
                      <Icon as={TrendingUp} className="size-5 text-muted-foreground" />
                      <Text variant="body" className="text-foreground">This Week</Text>
                    </View>
                    <Text variant="mono-lg" className="text-foreground">{completionsThisWeek}</Text>
                  </View>

                  {/* This Month */}
                  <View className="p-5 flex-row items-center justify-between border-b border-border">
                    <View className="flex-row items-center gap-3">
                      <Icon as={Check} className="size-5 text-muted-foreground" />
                      <Text variant="body" className="text-foreground">This Month</Text>
                    </View>
                    <Text variant="mono-lg" className="text-foreground">{completionsThisMonth}</Text>
                  </View>

                  {/* All Time */}
                  <View className="p-5 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Icon as={Award} className="size-5 text-muted-foreground" />
                      <Text variant="body" className="text-foreground">All Time</Text>
                    </View>
                    <Text variant="mono-lg" className="text-foreground">{completionsAllTime}</Text>
                  </View>
                </View>
              </View>

              {/* Top Performers */}
              {habits.length > 0 && (bestStreak.streak > 0 || mostCompleted.count > 0) && (
                <View>
                  <Text variant="h4" className="text-foreground mb-4">Top Performers</Text>
                  <View className="gap-3">
                    {bestStreak.streak > 0 && (
                      <View className="bg-card border border-border rounded-lg p-5">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Icon as={Flame} className="size-5 text-streak" />
                          <Text variant="caption" className="text-muted-foreground uppercase tracking-wide">
                            Best Streak
                          </Text>
                        </View>
                        <Text variant="h3" className="text-foreground" numberOfLines={1}>
                          {bestStreak.habitName}
                        </Text>
                        <Text variant="mono" className="text-muted-foreground mt-1">
                          {bestStreak.streak} {bestStreak.streak === 1 ? 'day' : 'days'}
                        </Text>
                      </View>
                    )}

                    {mostCompleted.count > 0 && (
                      <View className="bg-card border border-border rounded-lg p-5">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Icon as={Award} className="size-5 text-foreground" />
                          <Text variant="caption" className="text-muted-foreground uppercase tracking-wide">
                            Most Completed
                          </Text>
                        </View>
                        <Text variant="h3" className="text-foreground" numberOfLines={1}>
                          {mostCompleted.habitName}
                        </Text>
                        <Text variant="mono" className="text-muted-foreground mt-1">
                          {mostCompleted.count} {mostCompleted.count === 1 ? 'completion' : 'completions'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Empty state */}
              {habits.length === 0 && (
                <View className="items-center justify-center py-16">
                  <Text variant="h2" className="text-foreground mb-3">
                    Nothing to show yet
                  </Text>
                  <Text variant="body" className="text-muted-foreground text-center max-w-[280px]">
                    Complete habits to see your statistics
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
