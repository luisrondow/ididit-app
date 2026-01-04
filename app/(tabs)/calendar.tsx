// Calendar screen - Monthly heatmap view of all habits

import { View, ScrollView, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { CalendarHeatmap } from '@/components/calendar-heatmap';
import { getMultiHabitHeatmapData } from '@/lib/repositories/stats-repository';
import type { HeatmapData } from '@/types/models';
import { subtractMonthsFromDate, startOfDay, endOfDay } from '@/lib/utils/date-helpers';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function CalendarScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(3); // Show 3 months by default

  useEffect(() => {
    loadHeatmapData();
  }, [monthsToShow]);

  const loadHeatmapData = async () => {
    setIsLoading(true);
    try {
      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subtractMonthsFromDate(new Date(), monthsToShow)).toISOString();

      const data = await getMultiHabitHeatmapData(startDate, endDate);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
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

  // Calculate some summary stats
  const totalDaysWithActivity = heatmapData.filter((day) => day.completionCount > 0).length;
  const averageCompletionRate =
    heatmapData.length > 0
      ? Math.round(
          (heatmapData.reduce((acc, day) => {
            if (day.totalHabits > 0) {
              return acc + (day.completionCount / day.totalHabits) * 100;
            }
            return acc;
          }, 0) /
            heatmapData.length) *
            10
        ) / 10
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Calendar" subtitle={currentMonth} />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4 gap-4">
          {isLoading && heatmapData.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground">Loading calendar...</Text>
            </View>
          ) : (
            <>
              {/* Summary Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-card border border-border rounded-lg p-4">
                  <Text className="text-2xl font-bold text-foreground">{totalDaysWithActivity}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">Active Days</Text>
                </View>
                <View className="flex-1 bg-card border border-border rounded-lg p-4">
                  <Text className="text-2xl font-bold text-foreground">{averageCompletionRate}%</Text>
                  <Text className="text-xs text-muted-foreground mt-1">Avg Completion</Text>
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
                  disabled={monthsToShow <= 1}>
                  <Icon as={ChevronLeft} className="size-4" />
                  <Text className="ml-1">Less</Text>
                </Button>
                <Text className="text-sm text-muted-foreground">
                  Showing {monthsToShow} {monthsToShow === 1 ? 'month' : 'months'}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={showMoreMonths}
                  disabled={monthsToShow >= 12}>
                  <Text className="mr-1">More</Text>
                  <Icon as={ChevronRight} className="size-4" />
                </Button>
              </View>

              {/* Info text */}
              <View className="bg-muted/50 rounded-lg p-3">
                <Text className="text-xs text-muted-foreground text-center">
                  Darker colors indicate a higher percentage of habits completed on that day
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
