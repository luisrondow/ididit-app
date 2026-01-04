// Habit detail screen with binary heatmap and statistics

import { View, ScrollView } from 'react-native';
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
import { subtractMonthsFromDate, startOfDay, endOfDay } from '@/lib/utils/date-helpers';
import { useToast } from '@/lib/context/toast-context';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
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
      const loadedHabit = await getHabit(id);
      if (!loadedHabit) {
        toast.error('Habit not found');
        router.back();
        return;
      }
      setHabit(loadedHabit);

      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subtractMonthsFromDate(new Date(), 3)).toISOString();
      const heatmap = await getSingleHabitHeatmapData(id, startDate, endDate);
      setHeatmapData(heatmap);

      const logs = await getLogEntriesByHabitId(id);
      const streakInfo = calculateStreak(loadedHabit, logs);
      setCurrentStreak(streakInfo.currentStreak);
      setLongestStreak(streakInfo.longestStreak);

      const last30DaysStart = startOfDay(subtractMonthsFromDate(new Date(), 1)).toISOString();
      const stats = await getCompletionStats(id, last30DaysStart, endDate);
      setCompletionRate(stats.completionRate);
      setTotalCompletions(stats.totalCompletions);
    } catch (error) {
      console.error('Error loading habit details:', error);
      toast.error('Failed to load habit details');
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
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
          <Skeleton width={40} height={40} rounded="full" />
          <Skeleton width={120} height={24} />
          <Skeleton width={40} height={40} rounded="full" />
        </View>
        <ScrollView className="flex-1 p-5">
          <View className="gap-4">
            <View className="bg-card border border-border rounded-lg p-5 gap-3">
              <Skeleton width={200} height={32} />
              <SkeletonText lines={2} />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-card border border-border rounded-lg p-5 gap-2 items-center">
                <Skeleton width={32} height={32} rounded="full" />
                <Skeleton width={60} height={32} />
                <Skeleton width={80} height={12} />
              </View>
              <View className="flex-1 bg-card border border-border rounded-lg p-5 gap-2 items-center">
                <Skeleton width={32} height={32} rounded="full" />
                <Skeleton width={60} height={32} />
                <Skeleton width={80} height={12} />
              </View>
            </View>
            <View className="bg-card border border-border rounded-lg p-5 gap-3">
              <Skeleton width={100} height={20} />
              <Skeleton width="100%" height={200} />
            </View>
          </View>
        </ScrollView>
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
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Button>
        <Text variant="h3" className="text-foreground">Details</Text>
        <Button size="icon" variant="ghost" onPress={handleEdit}>
          <Icon as={Edit} className="size-5 text-foreground" />
        </Button>
      </View>

      <ScrollView className="flex-1">
        <View className="p-5 gap-4">
          {/* Hero - Habit Name */}
          <View className="bg-card border border-border rounded-lg p-5">
            <Text variant="display" className="text-foreground mb-2">{habit.name}</Text>
            {habit.description && (
              <Text variant="body" className="text-muted-foreground mb-4">
                {habit.description}
              </Text>
            )}
            <View className="flex-row items-center flex-wrap gap-2">
              <View className="border border-border px-3 py-1.5 rounded-full">
                <Text variant="caption" className="text-foreground font-sans-medium">
                  {getTimeRangeLabel()}
                </Text>
              </View>
              <View className="border border-border px-3 py-1.5 rounded-full">
                <Text variant="caption" className="text-muted-foreground font-mono">
                  {habit.targetFrequency}x
                </Text>
              </View>
              {habit.category && (
                <View className="border border-border px-3 py-1.5 rounded-full">
                  <Text variant="caption" className="text-muted-foreground">
                    {habit.category}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3">
            {/* Current Streak */}
            <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
              <Icon as={Flame} className="size-6 text-streak mb-3" />
              <Text variant="mono-xl" className="text-foreground">{currentStreak}</Text>
              <Text variant="caption" className="text-muted-foreground mt-1">Current Streak</Text>
            </View>

            {/* Longest Streak */}
            <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
              <Icon as={TrendingUp} className="size-6 text-foreground mb-3" />
              <Text variant="mono-xl" className="text-foreground">{longestStreak}</Text>
              <Text variant="caption" className="text-muted-foreground mt-1">Best Streak</Text>
            </View>
          </View>

          {/* Completion Rate (Last 30 days) */}
          <View className="bg-card border border-border rounded-lg p-5">
            <Text variant="h4" className="text-foreground mb-4">Last 30 Days</Text>
            <View className="flex-row items-end justify-between">
              <View>
                <Text variant="mono-2xl" className="text-foreground">{completionRate}%</Text>
                <Text variant="caption" className="text-muted-foreground mt-1">Completion Rate</Text>
              </View>
              <View className="items-end">
                <Text variant="mono-lg" className="text-foreground">{totalCompletions}</Text>
                <Text variant="caption" className="text-muted-foreground mt-1">Completions</Text>
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
