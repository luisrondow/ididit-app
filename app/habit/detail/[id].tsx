// Habit detail screen with binary heatmap and statistics

import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useHabitsStore } from '@/lib/store/habits-store';
import type { Habit } from '@/types/models';
import { ArrowLeft, Edit, Flame, TrendingUp } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { HabitHeatmap } from '@/components/habit-heatmap';
import { getSingleHabitHeatmapData, getCompletionStats } from '@/lib/repositories/stats-repository';
import { getLogEntriesByHabitId } from '@/lib/repositories/log-repository';
import { calculateStreak } from '@/lib/utils/streak-calculator';
import type { HeatmapData } from '@/types/models';
import { subMonths, startOfDay, endOfDay } from '@/lib/utils/date-helpers';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getHabit } = useHabitsStore();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHabitDetails();
  }, [id]);

  const loadHabitDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Load habit
      const loadedHabit = await getHabit(id);
      if (!loadedHabit) {
        Alert.alert('Error', 'Habit not found');
        router.back();
        return;
      }
      setHabit(loadedHabit);

      // Load heatmap data for last 3 months
      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subMonths(new Date(), 3)).toISOString();
      const heatmap = await getSingleHabitHeatmapData(id, startDate, endDate);
      setHeatmapData(heatmap);

      // Load logs and calculate streaks
      const logs = await getLogEntriesByHabitId(id);
      const streakInfo = calculateStreak(loadedHabit, logs);
      setCurrentStreak(streakInfo.currentStreak);
      setLongestStreak(streakInfo.longestStreak);

      // Calculate completion stats for last 30 days
      const last30DaysStart = startOfDay(subMonths(new Date(), 1)).toISOString();
      const stats = await getCompletionStats(id, last30DaysStart, endDate);
      setCompletionRate(stats.completionRate);
      setTotalCompletions(stats.totalCompletions);
    } catch (error) {
      console.error('Error loading habit details:', error);
      Alert.alert('Error', 'Failed to load habit details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (habit) {
      router.push({
        pathname: '/habit/[id]',
        params: { id: habit.id },
      });
    }
  };

  if (isLoading || !habit) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getTimeRangeLabel = () => {
    if (habit.timeRange === 'custom' && habit.customTimeRange) {
      return `${habit.customTimeRange.value} ${habit.customTimeRange.unit}`;
    }
    return habit.timeRange.charAt(0).toUpperCase() + habit.timeRange.slice(1);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5" />
        </Button>
        <Text className="text-xl font-semibold text-foreground">Habit Details</Text>
        <Button size="icon" variant="ghost" onPress={handleEdit}>
          <Icon as={Edit} className="size-5" />
        </Button>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 gap-4">
          {/* Habit Info */}
          <View className="bg-card border border-border rounded-lg p-4">
            <Text className="text-2xl font-bold text-foreground mb-2">{habit.name}</Text>
            {habit.description && (
              <Text className="text-sm text-muted-foreground mb-3">{habit.description}</Text>
            )}
            <View className="flex-row items-center gap-3">
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
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3">
            {/* Current Streak */}
            <View className="flex-1 bg-card border border-border rounded-lg p-4 items-center">
              <Icon as={Flame} className="size-6 text-orange-600 dark:text-orange-400 mb-2" />
              <Text className="text-2xl font-bold text-foreground">{currentStreak}</Text>
              <Text className="text-xs text-muted-foreground">Current Streak</Text>
            </View>

            {/* Longest Streak */}
            <View className="flex-1 bg-card border border-border rounded-lg p-4 items-center">
              <Icon as={TrendingUp} className="size-6 text-primary mb-2" />
              <Text className="text-2xl font-bold text-foreground">{longestStreak}</Text>
              <Text className="text-xs text-muted-foreground">Best Streak</Text>
            </View>
          </View>

          {/* Completion Rate (Last 30 days) */}
          <View className="bg-card border border-border rounded-lg p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Last 30 Days</Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-foreground">{completionRate}%</Text>
                <Text className="text-xs text-muted-foreground mt-1">Completion Rate</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-semibold text-foreground">{totalCompletions}</Text>
                <Text className="text-xs text-muted-foreground mt-1">Total Completions</Text>
              </View>
            </View>
          </View>

          {/* Heatmap */}
          <HabitHeatmap data={heatmapData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
