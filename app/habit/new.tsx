// Create new goal screen

import { View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useGoalsStore } from '@/lib/store/goals-store';
import type { Goal } from '@/types/models';
import { validateGoal } from '@/lib/utils/validators';
import { ArrowLeft, Target, Repeat, Calendar } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/lib/context/toast-context';
import { haptics } from '@/lib/utils/haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

const GOAL_TYPES = [
  { value: 'recurring', label: 'Habit', icon: Repeat, description: 'Resets each period' },
  { value: 'finite', label: 'Milestone', icon: Target, description: 'One-time target' },
] as const;

const TIME_RANGES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
] as const;

const CUSTOM_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
] as const;

export default function NewGoalScreen() {
  const router = useRouter();
  const toast = useToast();
  const { addGoal } = useGoalsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [goalType, setGoalType] = useState<'recurring' | 'finite'>('recurring');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customValue, setCustomValue] = useState('1');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [targetCount, setTargetCount] = useState('1');

  // Reset target count to 1 when switching to daily
  const handleTimeRangeChange = (newTimeRange: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setTimeRange(newTimeRange);
    if (newTimeRange === 'daily') {
      setTargetCount('1');
    }
  };
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      goalType,
      timeRange: goalType === 'recurring' ? timeRange : 'custom', // Finite goals use custom
      customTimeRange:
        goalType === 'recurring' && timeRange === 'custom'
          ? {
              value: parseInt(customValue, 10),
              unit: customUnit,
            }
          : undefined,
      targetCount: parseInt(targetCount, 10),
      startDate: now,
      endDate: goalType === 'finite' && endDate ? endDate.toISOString() : undefined,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    const validation = validateGoal(newGoal);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await addGoal(newGoal);
      haptics.success();
      toast.success('Goal created!');
      router.back();
    } catch (error) {
      haptics.error();
      toast.error('Failed to create goal');
      console.error('Error creating goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Button>
        <Text variant="h3" className="text-foreground">New Goal</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="gap-5">
          {/* Goal Type Selector */}
          <View className="gap-3">
            <Label className="font-sans-medium">Goal Type</Label>
            <View className="flex-row gap-3">
              {GOAL_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setGoalType(type.value)}
                  className={`flex-1 p-4 rounded-xl border ${
                    goalType === type.value
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <View className="items-center gap-2">
                    <Icon
                      as={type.icon}
                      className={`size-6 ${
                        goalType === type.value ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <Text
                      variant="body"
                      className={`font-sans-medium ${
                        goalType === type.value ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {type.label}
                    </Text>
                    <Text
                      variant="caption"
                      className="text-muted-foreground text-center"
                    >
                      {type.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Name */}
          <View className="gap-2">
            <Label className="font-sans-medium">Name</Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={goalType === 'recurring' ? 'e.g., Morning Meditation' : 'e.g., Read 10 Books'}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <Text variant="caption" className="text-destructive">{errors.name}</Text>
            )}
          </View>

          {/* Description */}
          <View className="gap-2">
            <Label className="font-sans-medium">Description</Label>
            <Textarea
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <Text variant="caption" className="text-destructive">{errors.description}</Text>
            )}
          </View>

          {/* Category */}
          <View className="gap-2">
            <Label className="font-sans-medium">Category</Label>
            <Input
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Health, Learning"
              className={errors.category ? 'border-destructive' : ''}
            />
            {errors.category && (
              <Text variant="caption" className="text-destructive">{errors.category}</Text>
            )}
          </View>

          {/* Time Range (Recurring only) */}
          {goalType === 'recurring' && (
            <View className="gap-3">
              <Label className="font-sans-medium">Time Range</Label>
              <View className="flex-row flex-wrap gap-2">
                {TIME_RANGES.map((range) => (
                  <Pressable
                    key={range.value}
                    onPress={() => handleTimeRangeChange(range.value)}
                    className={`px-4 py-2.5 rounded-full border ${
                      timeRange === range.value
                        ? 'bg-primary border-primary'
                        : 'bg-transparent border-border'
                    }`}
                  >
                    <Text
                      variant="body"
                      className={`font-sans-medium ${
                        timeRange === range.value ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {range.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Custom Time Range (Recurring + Custom) */}
          {goalType === 'recurring' && timeRange === 'custom' && (
            <View className="gap-3">
              <Label className="font-sans-medium">Custom Period</Label>
              <View className="flex-row gap-3 items-center">
                <Input
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="1"
                  keyboardType="number-pad"
                  className="w-20"
                />
                <View className="flex-row gap-2 flex-1">
                  {CUSTOM_UNITS.map((unit) => (
                    <Pressable
                      key={unit.value}
                      onPress={() => setCustomUnit(unit.value)}
                      className={`px-3 py-2 rounded-full border flex-1 items-center ${
                        customUnit === unit.value
                          ? 'bg-primary border-primary'
                          : 'bg-transparent border-border'
                      }`}
                    >
                      <Text
                        variant="caption"
                        className={`font-sans-medium ${
                          customUnit === unit.value ? 'text-primary-foreground' : 'text-foreground'
                        }`}
                      >
                        {unit.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Target Count (hidden for daily recurring goals) */}
          {!(goalType === 'recurring' && timeRange === 'daily') && (
            <View className="gap-2">
              <Label className="font-sans-medium">
                {goalType === 'recurring' ? 'Target per Period' : 'Target Count'}
              </Label>
              <Input
                value={targetCount}
                onChangeText={setTargetCount}
                placeholder="1"
                keyboardType="number-pad"
                className={errors.targetCount ? 'border-destructive' : ''}
              />
              <Text variant="caption" className="text-muted-foreground">
                {goalType === 'recurring'
                  ? `Times per ${timeRange === 'custom' ? 'period' : timeRange.replace('ly', '')}`
                  : 'Total times to complete this goal'}
              </Text>
              {errors.targetCount && (
                <Text variant="caption" className="text-destructive">{errors.targetCount}</Text>
              )}
            </View>
          )}

          {/* Deadline (Finite only) */}
          {goalType === 'finite' && (
            <View className="gap-2">
              <Label className="font-sans-medium">Deadline</Label>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className={`flex-row items-center gap-3 p-4 rounded-lg border ${
                  errors.endDate ? 'border-destructive' : 'border-border'
                } bg-card`}
              >
                <Icon as={Calendar} className="size-5 text-muted-foreground" />
                <Text
                  variant="body"
                  className={endDate ? 'text-foreground' : 'text-muted-foreground'}
                >
                  {endDate ? formatDate(endDate) : 'Select a deadline...'}
                </Text>
              </Pressable>
              {errors.endDate && (
                <Text variant="caption" className="text-destructive">{errors.endDate}</Text>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          )}

          {/* Create Button */}
          <Button onPress={handleCreate} disabled={isLoading} className="mt-4">
            <Text className="text-primary-foreground font-sans-medium">
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
