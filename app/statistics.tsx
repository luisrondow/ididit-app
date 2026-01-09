// Statistics screen - Overall progress and insights

import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useGoalsStore } from '@/lib/store/goals-store';
import { getOverallStats } from '@/lib/repositories/stats-repository';
import { getLogEntriesByGoalId } from '@/lib/repositories/log-repository';
import { calculateStreak } from '@/lib/utils/streak-calculator';
import { calculateFiniteGoalProgress } from '@/lib/utils/completion-calculator';
import { TrendingUp, Target, Flame, Check, Calendar, Award, ArrowLeft, Repeat, CheckCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'expo-router';

export default function StatisticsScreen() {
  const router = useRouter();
  const { goals, loadActiveGoals } = useGoalsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [totalGoals, setTotalGoals] = useState(0);
  const [activeGoals, setActiveGoals] = useState(0);
  const [recurringCount, setRecurringCount] = useState(0);
  const [finiteCount, setFiniteCount] = useState(0);
  const [completionsToday, setCompletionsToday] = useState(0);
  const [completionsThisWeek, setCompletionsThisWeek] = useState(0);
  const [completionsThisMonth, setCompletionsThisMonth] = useState(0);
  const [completionsAllTime, setCompletionsAllTime] = useState(0);

  const [bestStreak, setBestStreak] = useState({ goalName: '', streak: 0 });
  const [mostCompleted, setMostCompleted] = useState({ goalName: '', count: 0 });
  const [closestToCompletion, setClosestToCompletion] = useState({ goalName: '', percentage: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      await loadActiveGoals();

      const overallStats = await getOverallStats();
      setTotalGoals(overallStats.totalGoals);
      setActiveGoals(overallStats.activeGoals);
      setRecurringCount(overallStats.recurringGoals);
      setFiniteCount(overallStats.finiteGoals);
      setCompletionsToday(overallStats.totalCompletionsToday);
      setCompletionsThisWeek(overallStats.totalCompletionsThisWeek);
      setCompletionsThisMonth(overallStats.totalCompletionsThisMonth);
      setCompletionsAllTime(overallStats.totalCompletionsAllTime);

      let maxStreak = 0;
      let maxStreakGoal = '';
      let maxCompletions = 0;
      let maxCompletionsGoal = '';
      let highestIncompleteProgress = 0;
      let closestGoal = '';

      for (const goal of goals) {
        const logs = await getLogEntriesByGoalId(goal.id);

        if (goal.goalType === 'recurring') {
          const streakInfo = calculateStreak(goal, logs);
          if (streakInfo.longestStreak > maxStreak) {
            maxStreak = streakInfo.longestStreak;
            maxStreakGoal = goal.name;
          }
        } else {
          // Finite goal - check if it's close to completion
          const progress = calculateFiniteGoalProgress(goal, logs);
          if (!progress.isComplete && progress.percentage > highestIncompleteProgress) {
            highestIncompleteProgress = progress.percentage;
            closestGoal = goal.name;
          }
        }

        if (logs.length > maxCompletions) {
          maxCompletions = logs.length;
          maxCompletionsGoal = goal.name;
        }
      }

      setBestStreak({ goalName: maxStreakGoal, streak: maxStreak });
      setMostCompleted({ goalName: maxCompletionsGoal, count: maxCompletions });
      setClosestToCompletion({ goalName: closestGoal, percentage: highestIncompleteProgress });
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
      {/* Header with back button */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Button>
        <Text variant="h3" className="text-foreground">Statistics</Text>
        <View className="w-10" />
      </View>

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
              {/* Goals Overview Grid */}
              <View>
                <Text variant="h4" className="text-foreground mb-4">Overview</Text>
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                    <Icon as={Target} className="size-6 text-foreground mb-3" />
                    <Text variant="mono-xl" className="text-foreground">{totalGoals}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Total</Text>
                  </View>
                  <View className="flex-1 bg-card border border-border rounded-lg p-5 items-center">
                    <Icon as={Check} className="size-6 text-success mb-3" />
                    <Text variant="mono-xl" className="text-foreground">{activeGoals}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Active</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-card border border-border rounded-lg p-4 items-center">
                    <Icon as={Repeat} className="size-5 text-muted-foreground mb-2" />
                    <Text variant="mono-lg" className="text-foreground">{recurringCount}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Habit</Text>
                  </View>
                  <View className="flex-1 bg-card border border-primary/30 bg-primary/5 rounded-lg p-4 items-center">
                    <Icon as={Target} className="size-5 text-primary mb-2" />
                    <Text variant="mono-lg" className="text-foreground">{finiteCount}</Text>
                    <Text variant="caption" className="text-muted-foreground mt-1">Milestone</Text>
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
              {goals.length > 0 && (bestStreak.streak > 0 || mostCompleted.count > 0 || closestToCompletion.percentage > 0) && (
                <View>
                  <Text variant="h4" className="text-foreground mb-4">Highlights</Text>
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
                          {bestStreak.goalName}
                        </Text>
                        <Text variant="mono" className="text-muted-foreground mt-1">
                          {bestStreak.streak} {bestStreak.streak === 1 ? 'period' : 'periods'}
                        </Text>
                      </View>
                    )}

                    {closestToCompletion.percentage > 0 && (
                      <View className="bg-card border border-primary/30 bg-primary/5 rounded-lg p-5">
                        <View className="flex-row items-center gap-2 mb-3">
                          <Icon as={CheckCircle} className="size-5 text-primary" />
                          <Text variant="caption" className="text-muted-foreground uppercase tracking-wide">
                            Almost There
                          </Text>
                        </View>
                        <Text variant="h3" className="text-foreground" numberOfLines={1}>
                          {closestToCompletion.goalName}
                        </Text>
                        <Text variant="mono" className="text-primary mt-1">
                          {closestToCompletion.percentage}% complete
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
                          {mostCompleted.goalName}
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
              {goals.length === 0 && (
                <View className="items-center justify-center py-16">
                  <Text variant="h2" className="text-foreground mb-3">
                    Nothing to show yet
                  </Text>
                  <Text variant="body" className="text-muted-foreground text-center max-w-[280px]">
                    Complete goals to see your statistics
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
