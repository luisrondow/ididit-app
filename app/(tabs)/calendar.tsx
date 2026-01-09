// Calendar screen - Monthly heatmap view of all goals

import { View, ScrollView, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { CalendarHeatmap } from '@/components/calendar-heatmap';
import { getMultiGoalHeatmapData } from '@/lib/repositories/stats-repository';
import type { HeatmapData } from '@/types/models';
import { subtractMonthsFromDate, startOfDay, endOfDay } from '@/lib/utils/date-helpers';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useFocusEffect } from 'expo-router';

export default function CalendarScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(3);
  const [error, setError] = useState<string | null>(null);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHeatmapData();
    }, [monthsToShow])
  );

  const loadHeatmapData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subtractMonthsFromDate(new Date(), monthsToShow)).toISOString();

      const data = await getMultiGoalHeatmapData(startDate, endDate);
      setHeatmapData(data);
    } catch (err) {
      console.error('Error loading heatmap data:', err);
      setError('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHeatmapData();
    setRefreshing(false);
  };

  const showMoreMonths = () => {
    setMonthsToShow((prev) => Math.min(prev + 3, 12));
  };

  const showLessMonths = () => {
    setMonthsToShow((prev) => Math.max(prev - 3, 1));
  };

  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate summary stats with memoization
  const stats = useMemo(() => {
    // Active days = days where user logged at least one completion
    const activeDays = heatmapData.filter((day) => day.completionCount > 0).length;
    
    // Days with goals = days where there were active goals to track
    const daysWithGoals = heatmapData.filter((day) => day.totalGoals > 0);
    
    // Average completion rate = only count days where there were goals to complete
    let avgCompletionRate = 0;
    if (daysWithGoals.length > 0) {
      const totalPercentage = daysWithGoals.reduce((acc, day) => {
        return acc + (day.completionCount / day.totalGoals) * 100;
      }, 0);
      avgCompletionRate = Math.round((totalPercentage / daysWithGoals.length) * 10) / 10;
    }

    // Total completions in period
    const totalCompletions = heatmapData.reduce((acc, day) => acc + day.completionCount, 0);

    return {
      activeDays,
      daysWithGoals: daysWithGoals.length,
      avgCompletionRate,
      totalCompletions,
    };
  }, [heatmapData]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Calendar" subtitle={currentMonth} />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="gap-5 p-5">
          {isLoading && heatmapData.length === 0 ? (
            <View className="gap-4">
              <View className="flex-row gap-3">
                <View className="flex-1 items-center gap-2 rounded-lg border border-border bg-card p-5">
                  <Skeleton width={60} height={32} />
                  <Skeleton width={80} height={14} />
                </View>
                <View className="flex-1 items-center gap-2 rounded-lg border border-border bg-card p-5">
                  <Skeleton width={60} height={32} />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
              <View className="gap-3 rounded-lg border border-border bg-card p-5">
                <Skeleton width="100%" height={200} />
              </View>
            </View>
          ) : error ? (
            <View className="items-center justify-center rounded-lg border border-destructive bg-card p-8">
              <Text variant="body" className="text-center text-destructive">
                {error}
              </Text>
              <Button variant="outline" size="sm" onPress={loadHeatmapData} className="mt-4">
                <Text className="text-foreground">Retry</Text>
              </Button>
            </View>
          ) : (
            <>
              {/* Summary Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 items-center rounded-lg border border-border bg-card p-5">
                  <Icon as={Calendar} className="mb-2 size-5 text-primary" />
                  <Text variant="mono-xl" className="text-foreground">{stats.activeDays}</Text>
                  <Text variant="caption" className="mt-1 text-muted-foreground">Active Days</Text>
                </View>
                <View className="flex-1 items-center rounded-lg border border-border bg-card p-5">
                  <Icon as={TrendingUp} className="mb-2 size-5 text-success" />
                  <Text variant="mono-xl" className="text-foreground">{stats.avgCompletionRate}%</Text>
                  <Text variant="caption" className="mt-1 text-muted-foreground">Avg Completion</Text>
                </View>
              </View>

              {/* Extra stats row */}
              <View className="flex-row gap-3">
                <View className="flex-1 items-center rounded-lg border border-border bg-card p-4">
                  <Text variant="mono-lg" className="text-foreground">{stats.totalCompletions}</Text>
                  <Text variant="caption" className="mt-1 text-muted-foreground">Total Logged</Text>
                </View>
                <View className="flex-1 items-center rounded-lg border border-border bg-card p-4">
                  <Text variant="mono-lg" className="text-foreground">{stats.daysWithGoals}</Text>
                  <Text variant="caption" className="mt-1 text-muted-foreground">Days Tracked</Text>
                </View>
              </View>

              {/* Heatmap */}
              <CalendarHeatmap data={heatmapData} />

              {/* Time Range Controls */}
              <View className="flex-row items-center justify-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={showLessMonths}
                  disabled={monthsToShow <= 1}
                >
                  <Icon as={ChevronLeft} className="size-4 text-foreground" />
                </Button>
                <Text variant="mono" className="text-muted-foreground">
                  {monthsToShow} {monthsToShow === 1 ? 'month' : 'months'}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={showMoreMonths}
                  disabled={monthsToShow >= 12}
                >
                  <Icon as={ChevronRight} className="size-4 text-foreground" />
                </Button>
              </View>

              {/* Info text */}
              <View className="rounded-lg border border-border p-4">
                <Text variant="caption" className="text-center text-muted-foreground">
                  Color intensity shows % of goals completed each day
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
