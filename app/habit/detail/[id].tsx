// Goal detail screen with type-specific statistics

import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useGoalsStore } from '@/lib/store/goals-store';
import type { Goal, HeatmapData, FiniteGoalProgress } from '@/types/models';
import { ArrowLeft, Edit, Flame, TrendingUp, Target, Clock, CheckCircle, Calendar } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { HabitHeatmap } from '@/components/habit-heatmap';
import { getSingleGoalHeatmapData, getCompletionStats } from '@/lib/repositories/stats-repository';
import { getLogEntriesByGoalId } from '@/lib/repositories/log-repository';
import { calculateStreak } from '@/lib/utils/streak-calculator';
import { calculateFiniteGoalProgress } from '@/lib/utils/completion-calculator';
import { subtractMonthsFromDate, startOfDay, endOfDay } from '@/lib/utils/date-helpers';
import { useToast } from '@/lib/context/toast-context';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { getGoal } = useGoalsStore();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  
  // Recurring goal stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  
  // Finite goal stats
  const [finiteProgress, setFiniteProgress] = useState<FiniteGoalProgress | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoalDetails();
  }, [id]);

  const loadGoalDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const loadedGoal = await getGoal(id);
      if (!loadedGoal) {
        toast.error('Goal not found');
        router.back();
        return;
      }
      setGoal(loadedGoal);

      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subtractMonthsFromDate(new Date(), 3)).toISOString();
      const heatmap = await getSingleGoalHeatmapData(id, startDate, endDate);
      setHeatmapData(heatmap);

      const logs = await getLogEntriesByGoalId(id);

      if (loadedGoal.goalType === 'recurring') {
        // Calculate recurring goal stats
        const streakInfo = calculateStreak(loadedGoal, logs);
        setCurrentStreak(streakInfo.currentStreak);
        setLongestStreak(streakInfo.longestStreak);

        const last30DaysStart = startOfDay(subtractMonthsFromDate(new Date(), 1)).toISOString();
        const stats = await getCompletionStats(id, last30DaysStart, endDate);
        setCompletionRate(stats.completionRate);
        setTotalCompletions(stats.totalCompletions);
      } else {
        // Calculate finite goal stats
        const progress = calculateFiniteGoalProgress(loadedGoal, logs);
        setFiniteProgress(progress);
        setTotalCompletions(progress.completed);
      }
    } catch (error) {
      console.error('Error loading goal details:', error);
      toast.error('Failed to load goal details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (goal) {
      router.push({
        pathname: '/habit/[id]',
        params: { id: goal.id },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading || !goal) {
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

  const isRecurring = goal.goalType === 'recurring';

  const getTimeRangeLabel = () => {
    if (goal.timeRange === 'custom' && goal.customTimeRange) {
      return `${goal.customTimeRange.value} ${goal.customTimeRange.unit}`;
    }
    return goal.timeRange.charAt(0).toUpperCase() + goal.timeRange.slice(1);
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
          {/* Hero - Goal Name */}
          <View className="bg-card border border-border rounded-lg p-5">
            <Text variant="display" className="text-foreground mb-2">{goal.name}</Text>
            {goal.description && (
              <Text variant="body" className="text-muted-foreground mb-4">
                {goal.description}
              </Text>
            )}
            <View className="flex-row items-center flex-wrap gap-2">
              {/* Goal type badge */}
              <View className={`flex-row items-center gap-1.5 border px-3 py-1.5 rounded-full ${
                isRecurring ? 'border-border' : 'border-primary/30 bg-primary/5'
              }`}>
                <Icon
                  as={isRecurring ? Flame : Target}
                  className={`size-3 ${isRecurring ? 'text-muted-foreground' : 'text-primary'}`}
                />
                <Text
                  variant="caption"
                  className={`font-sans-medium ${isRecurring ? 'text-muted-foreground' : 'text-primary'}`}
                >
                  {isRecurring ? 'Recurring' : 'Finite'}
                </Text>
              </View>

              {isRecurring && (
                <View className="border border-border px-3 py-1.5 rounded-full">
                  <Text variant="caption" className="text-foreground font-sans-medium">
                    {getTimeRangeLabel()}
                  </Text>
                </View>
              )}

              <View className="border border-border px-3 py-1.5 rounded-full">
                <Text variant="caption" className="text-muted-foreground font-mono">
                  {goal.targetCount}x{isRecurring ? '' : ' total'}
                </Text>
              </View>

              {goal.category && (
                <View className="border border-border px-3 py-1.5 rounded-full">
                  <Text variant="caption" className="text-muted-foreground">
                    {goal.category}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats - Different for recurring vs finite */}
          {isRecurring ? (
            <>
              {/* Recurring: Streak Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                  <Icon as={Flame} className="size-6 text-streak mb-3" />
                  <Text variant="mono-xl" className="text-foreground">{currentStreak}</Text>
                  <Text variant="caption" className="text-muted-foreground mt-1">Current Streak</Text>
                </View>

                <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                  <Icon as={TrendingUp} className="size-6 text-foreground mb-3" />
                  <Text variant="mono-xl" className="text-foreground">{longestStreak}</Text>
                  <Text variant="caption" className="text-muted-foreground mt-1">Best Streak</Text>
                </View>
              </View>

              {/* Recurring: Completion Rate */}
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
            </>
          ) : (
            <>
              {/* Finite: Progress Overview */}
              {finiteProgress && (
                <>
                  {/* Large Progress Card */}
                  <View className={`bg-card border rounded-lg p-5 ${
                    finiteProgress.isComplete ? 'border-success/50 bg-success/5' : 'border-border'
                  }`}>
                    <View className="flex-row items-center justify-between mb-4">
                      <Text variant="h4" className="text-foreground">Progress</Text>
                      {finiteProgress.isComplete && (
                        <View className="flex-row items-center gap-1.5 bg-success/10 px-3 py-1 rounded-full">
                          <Icon as={CheckCircle} className="size-4 text-success" />
                          <Text variant="caption" className="font-sans-medium text-success">Complete!</Text>
                        </View>
                      )}
                      {finiteProgress.isOverdue && !finiteProgress.isComplete && (
                        <View className="flex-row items-center gap-1.5 bg-destructive/10 px-3 py-1 rounded-full">
                          <Icon as={Clock} className="size-4 text-destructive" />
                          <Text variant="caption" className="font-sans-medium text-destructive">Overdue</Text>
                        </View>
                      )}
                    </View>

                    {/* Large percentage */}
                    <Text variant="display" className={`text-center mb-2 ${
                      finiteProgress.isComplete ? 'text-success' : 'text-foreground'
                    }`}>
                      {finiteProgress.percentage}%
                    </Text>

                    {/* Progress bar */}
                    <View className="h-3 w-full rounded-full bg-border/40 overflow-hidden mb-3">
                      <View
                        className={`h-full rounded-full ${finiteProgress.isComplete ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${finiteProgress.percentage}%` }}
                      />
                    </View>

                    {/* Completion count */}
                    <Text variant="body" className="text-center text-muted-foreground">
                      {finiteProgress.completed} of {finiteProgress.target} completed
                    </Text>
                  </View>

                  {/* Time Stats */}
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                      <Icon as={Calendar} className="size-6 text-foreground mb-3" />
                      <Text variant="mono-xl" className="text-foreground">{finiteProgress.daysElapsed}</Text>
                      <Text variant="caption" className="text-muted-foreground mt-1">Days Elapsed</Text>
                    </View>

                    <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                      <Icon as={Clock} className={`size-6 mb-3 ${
                        finiteProgress.isOverdue ? 'text-destructive' : 'text-foreground'
                      }`} />
                      <Text variant="mono-xl" className={
                        finiteProgress.isOverdue ? 'text-destructive' : 'text-foreground'
                      }>
                        {finiteProgress.daysRemaining}
                      </Text>
                      <Text variant="caption" className="text-muted-foreground mt-1">Days Left</Text>
                    </View>
                  </View>

                  {/* Deadline */}
                  {goal.endDate && (
                    <View className="bg-card border border-border rounded-lg p-5">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text variant="caption" className="text-muted-foreground mb-1">Deadline</Text>
                          <Text variant="h4" className="text-foreground">{formatDate(goal.endDate)}</Text>
                        </View>
                        <View className="items-end">
                          <Text variant="caption" className="text-muted-foreground mb-1">Started</Text>
                          <Text variant="body" className="text-foreground">{formatDate(goal.startDate)}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* Heatmap - useful for both types */}
          <HabitHeatmap data={heatmapData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
