// Create new log entry screen

import { View, ScrollView, Pressable, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useCallback } from 'react';
import { useGoalsStore } from '@/lib/store/goals-store';
import { useLogsStore } from '@/lib/store/logs-store';
import { useToast } from '@/lib/context/toast-context';
import { haptics } from '@/lib/utils/haptics';
import { ArrowLeft, ChevronDown, Check, Target, Repeat } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'expo-router';
import type { LogEntry, Goal } from '@/types/models';
import { format, isValid } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MilestoneCompletedDialog } from '@/components/milestone-completed-dialog';

export default function NewLogScreen() {
  const router = useRouter();
  const toast = useToast();
  const colorScheme = useColorScheme();
  const { goals, loadActiveGoals } = useGoalsStore();
  const { addLogWithMilestoneCheck } = useLogsStore();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Milestone celebration state
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [completedMilestoneGoal, setCompletedMilestoneGoal] = useState<Goal | null>(null);

  // Load goals on mount
  useEffect(() => {
    loadActiveGoals();
  }, [loadActiveGoals]);

  // Auto-select first goal if only one exists
  useEffect(() => {
    if (goals.length === 1 && !selectedGoal) {
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  const handleDateChange = useCallback((event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date && isValid(date)) {
      // Keep time at 00:00:00
      date.setHours(0, 0, 0, 0);
      setSelectedDate(date);
    }
  }, []);

  // Handle closing the milestone dialog and navigating back
  const handleMilestoneDialogClose = useCallback((open: boolean) => {
    setShowMilestoneDialog(open);
    if (!open) {
      // Navigate back after closing the celebration dialog
      router.back();
    }
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedGoal) {
      toast.error('Please select a goal');
      return;
    }

    // Prevent future dates
    if (selectedDate > new Date()) {
      toast.error('Cannot log for future dates');
      return;
    }

    setIsLoading(true);
    haptics.medium();

    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: selectedGoal.id,
      completedAt: selectedDate.toISOString(),
      loggedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    try {
      const result = await addLogWithMilestoneCheck(newLog, selectedGoal);

      if (result.milestoneJustCompleted) {
        // Show celebration dialog instead of immediately navigating back
        setCompletedMilestoneGoal(selectedGoal);
        setShowMilestoneDialog(true);
        // Don't show toast or navigate - the dialog will handle it
      } else {
        haptics.success();
        toast.success('Activity logged!');
        router.back();
      }
    } catch (error) {
      haptics.error();
      toast.error('Failed to log activity');
      console.error('Error creating log:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGoal, selectedDate, notes, addLogWithMilestoneCheck, router, toast]);

  return (
    <>
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Button>
        <Text variant="h3" className="text-foreground">
          Log Activity
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="gap-5">
          {/* Goal Selector */}
          <View className="gap-2">
            <Label className="font-sans-medium">Goal</Label>
            <Pressable
              onPress={() => setShowGoalPicker(!showGoalPicker)}
              className="flex-row items-center justify-between rounded-lg border border-border bg-background px-4 py-3.5">
              <View className="flex-row items-center gap-2 flex-1">
                {selectedGoal && (
                  <Icon
                    as={selectedGoal.goalType === 'recurring' ? Repeat : Target}
                    className={`size-4 ${selectedGoal.goalType === 'recurring' ? 'text-muted-foreground' : 'text-primary'}`}
                  />
                )}
                <Text
                  variant="body"
                  className={selectedGoal ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedGoal?.name ?? 'Select a goal'}
                </Text>
              </View>
              <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
            </Pressable>

            {showGoalPicker && (
              <View className="overflow-hidden rounded-lg border border-border bg-card">
                {goals.length === 0 ? (
                  <View className="px-4 py-3">
                    <Text variant="body" className="text-muted-foreground">
                      No active goals
                    </Text>
                  </View>
                ) : (
                  goals.map((goal) => (
                    <Pressable
                      key={goal.id}
                      onPress={() => {
                        setSelectedGoal(goal);
                        setShowGoalPicker(false);
                      }}
                      className={`flex-row items-center justify-between border-b border-border px-4 py-3.5 last:border-b-0 active:bg-accent ${
                        selectedGoal?.id === goal.id ? 'bg-accent' : ''
                      }`}>
                      <View className="flex-row items-center gap-2">
                        <Icon
                          as={goal.goalType === 'recurring' ? Repeat : Target}
                          className={`size-4 ${goal.goalType === 'recurring' ? 'text-muted-foreground' : 'text-primary'}`}
                        />
                        <Text variant="body" className="text-foreground">
                          {goal.name}
                        </Text>
                      </View>
                      {selectedGoal?.id === goal.id && (
                        <Icon as={Check} className="size-4 text-primary" />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Date Picker */}
          <View className="gap-2">
            <Label className="font-sans-medium">Date</Label>
            <Pressable
              onPress={() => setShowDatePicker(!showDatePicker)}
              className="rounded-lg border border-border bg-background px-4 py-3.5">
              <Text variant="body" className="text-foreground">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </Text>
            </Pressable>

            {showDatePicker && (
              <View className="items-center overflow-hidden rounded-lg border border-border bg-card">
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant={colorScheme ?? 'light'}
                  accentColor="#3b82f6"
                />
                {Platform.OS === 'ios' && (
                  <View className="w-full border-t border-border p-3">
                    <Button onPress={() => setShowDatePicker(false)}>
                      <Text className="font-sans-medium text-primary-foreground">Done</Text>
                    </Button>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="gap-2">
            <Label className="font-sans-medium">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this activity..."
              className="min-h-24"
            />
          </View>

          {/* Submit Button */}
          <Button onPress={handleSubmit} disabled={isLoading || !selectedGoal} className="mt-4">
            <Text className="font-sans-medium text-primary-foreground">
              {isLoading ? 'Saving...' : 'Log Activity'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>

    {/* Milestone Completion Celebration Dialog */}
    <MilestoneCompletedDialog
      open={showMilestoneDialog}
      onOpenChange={handleMilestoneDialogClose}
      goal={completedMilestoneGoal}
    />
    </>
  );
}
