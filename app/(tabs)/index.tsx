// Dashboard screen - Today's goals and quick stats

import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { Plus, BarChart3 } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGoalsStore } from '@/lib/store/goals-store';
import { useEffect, useState, useCallback } from 'react';
import { GoalCard } from '@/components/goal-card';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getCompletionCountForDate,
  getLogEntriesByGoalId,
} from '@/lib/repositories/log-repository';
import { calculateStreak } from '@/lib/utils/streak-calculator';
import { calculateFiniteGoalProgress, getCompletionCountForCurrentPeriod } from '@/lib/utils/completion-calculator';
import type { FiniteGoalProgress } from '@/types/models';
import { useToast } from '@/lib/context/toast-context';
import { SkeletonCard } from '@/components/ui/skeleton';
import { haptics } from '@/lib/utils/haptics';
import { FadeInView } from '@/components/ui/animated-view';
import { FloatingActionButton } from '@/components/floating-action-button';

export default function DashboardScreen() {
  const router = useRouter();
  const toast = useToast();
  const { goals, loadActiveGoals, removeGoal, toggleArchive, isLoading } = useGoalsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [finiteProgress, setFiniteProgress] = useState<Record<string, FiniteGoalProgress>>({});

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = useCallback(async () => {
    await loadActiveGoals();
  }, [loadActiveGoals]);

  useEffect(() => {
    if (goals.length > 0) {
      loadGoalStats();
    }
  }, [goals]);

  const loadGoalStats = useCallback(async () => {
    const counts: Record<string, number> = {};
    const streakData: Record<string, number> = {};
    const progressData: Record<string, FiniteGoalProgress> = {};

    for (const goal of goals) {
      const logs = await getLogEntriesByGoalId(goal.id);

      if (goal.goalType === 'recurring') {
        // For recurring goals: get period completion count and streak
        const count = getCompletionCountForCurrentPeriod(goal, logs);
        counts[goal.id] = count;

        const streakInfo = calculateStreak(goal, logs);
        streakData[goal.id] = streakInfo.currentStreak;
      } else {
        // For finite goals: calculate overall progress
        const progress = calculateFiniteGoalProgress(goal, logs);
        progressData[goal.id] = progress;
        counts[goal.id] = progress.completed;
      }
    }

    setCompletionCounts(counts);
    setStreaks(streakData);
    setFiniteProgress(progressData);
  }, [goals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDelete = useCallback(
    (id: string) => {
      haptics.warning();
      Alert.alert(
        'Delete Goal',
        'Are you sure you want to delete this goal? This will also delete all associated log entries.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeGoal(id);
                haptics.success();
                toast.success('Goal deleted');
              } catch (error) {
                haptics.error();
                toast.error('Failed to delete goal');
                console.error('Error deleting goal:', error);
              }
            },
          },
        ]
      );
    },
    [removeGoal, toast]
  );

  const handleArchive = useCallback(
    async (id: string, isArchived: boolean) => {
      haptics.light();
      try {
        await toggleArchive(id, isArchived);
        haptics.success();
        toast.success(isArchived ? 'Goal archived' : 'Goal unarchived');
      } catch (error) {
        haptics.error();
        toast.error('Failed to archive goal');
        console.error('Error archiving goal:', error);
      }
    },
    [toggleArchive, toast]
  );

  const handleCreateGoal = useCallback(() => {
    router.push('/habit/new');
  }, [router]);

  const handleOpenStatistics = useCallback(() => {
    router.push('/statistics');
  }, [router]);

  // Separate goals by type for display
  const recurringGoals = goals.filter(g => g.goalType === 'recurring');
  const finiteGoals = goals.filter(g => g.goalType === 'finite');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader
        title="Did you do it?"
        subtitle={today}
        rightAction={
          <View className="flex-row items-center gap-1">
            <Button size="icon" variant="ghost" onPress={handleOpenStatistics}>
              <Icon as={BarChart3} className="size-5 text-foreground" />
            </Button>
            <Button size="icon" variant="ghost" onPress={handleCreateGoal}>
              <Icon as={Plus} className="size-5 text-foreground" />
            </Button>
          </View>
        }
      />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-5">
          {isLoading && goals.length === 0 ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : goals.length === 0 ? (
            // Empty state
            <FadeInView delay={0}>
              <View className="items-center justify-center py-20">
                <Text variant="h2" className="mb-3 text-foreground">
                  No goals yet
                </Text>
                <Text
                  variant="body"
                  className="mb-8 max-w-[280px] text-center text-muted-foreground">
                  Create your first goal to start tracking your progress
                </Text>
                <Button onPress={handleCreateGoal}>
                  <Icon as={Plus} className="mr-2 size-4 text-primary-foreground" />
                  <Text className="font-sans-medium text-primary-foreground">Create Goal</Text>
                </Button>
              </View>
            </FadeInView>
          ) : (
            <View>
              <FadeInView delay={0}>
                <Text variant="caption" className="mb-4 font-mono text-muted-foreground">
                  {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
                </Text>
              </FadeInView>

              {/* Recurring Goals */}
              {recurringGoals.length > 0 && (
                <>
                  {finiteGoals.length > 0 && (
                    <FadeInView delay={25}>
                      <Text variant="caption" className="mb-2 font-sans-medium text-muted-foreground uppercase tracking-wide">
                        Recurring
                      </Text>
                    </FadeInView>
                  )}
                  {recurringGoals.map((goal, index) => (
                    <FadeInView key={goal.id} delay={50 * (index + 1)}>
                      <GoalCard
                        goal={goal}
                        completionCount={completionCounts[goal.id] ?? 0}
                        currentStreak={streaks[goal.id] ?? 0}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onPress={() => {
                          router.push({
                            pathname: '/habit/detail/[id]',
                            params: { id: goal.id },
                          });
                        }}
                      />
                    </FadeInView>
                  ))}
                </>
              )}

              {/* Finite Goals */}
              {finiteGoals.length > 0 && (
                <>
                  {recurringGoals.length > 0 && (
                    <FadeInView delay={50 * (recurringGoals.length + 1)}>
                      <Text variant="caption" className="mb-2 mt-4 font-sans-medium text-muted-foreground uppercase tracking-wide">
                        Finite Goals
                      </Text>
                    </FadeInView>
                  )}
                  {finiteGoals.map((goal, index) => (
                    <FadeInView key={goal.id} delay={50 * (recurringGoals.length + index + 2)}>
                      <GoalCard
                        goal={goal}
                        finiteProgress={finiteProgress[goal.id]}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onPress={() => {
                          router.push({
                            pathname: '/habit/detail/[id]',
                            params: { id: goal.id },
                          });
                        }}
                      />
                    </FadeInView>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
