// Create new habit screen

import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useHabitsStore } from '@/lib/store/habits-store';
import type { Habit } from '@/types/models';
import { validateHabit } from '@/lib/utils/validators';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/lib/context/toast-context';
import { haptics } from '@/lib/utils/haptics';

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

export default function NewHabitScreen() {
  const router = useRouter();
  const toast = useToast();
  const { addHabit } = useHabitsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customValue, setCustomValue] = useState('1');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [targetFrequency, setTargetFrequency] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      timeRange,
      customTimeRange:
        timeRange === 'custom'
          ? {
              value: parseInt(customValue, 10),
              unit: customUnit,
            }
          : undefined,
      targetFrequency: parseInt(targetFrequency, 10),
      startDate: now,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    const validation = validateHabit(newHabit);
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
      await addHabit(newHabit);
      haptics.success();
      toast.success('Habit created!');
      router.back();
    } catch (error) {
      haptics.error();
      toast.error('Failed to create habit');
      console.error('Error creating habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Button>
        <Text variant="h3" className="text-foreground">New Habit</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="gap-5">
          {/* Name */}
          <View className="gap-2">
            <Label className="font-sans-medium">Name</Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Meditation"
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
              placeholder="e.g., Health, Productivity"
              className={errors.category ? 'border-destructive' : ''}
            />
            {errors.category && (
              <Text variant="caption" className="text-destructive">{errors.category}</Text>
            )}
          </View>

          {/* Time Range */}
          <View className="gap-3">
            <Label className="font-sans-medium">Time Range</Label>
            <View className="flex-row flex-wrap gap-2">
              {TIME_RANGES.map((range) => (
                <Pressable
                  key={range.value}
                  onPress={() => setTimeRange(range.value)}
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

          {/* Custom Time Range */}
          {timeRange === 'custom' && (
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

          {/* Target Frequency */}
          <View className="gap-2">
            <Label className="font-sans-medium">Target Frequency</Label>
            <Input
              value={targetFrequency}
              onChangeText={setTargetFrequency}
              placeholder="1"
              keyboardType="number-pad"
              className={errors.targetFrequency ? 'border-destructive' : ''}
            />
            <Text variant="caption" className="text-muted-foreground">
              Times per {timeRange === 'custom' ? 'period' : timeRange.replace('ly', '')}
            </Text>
            {errors.targetFrequency && (
              <Text variant="caption" className="text-destructive">{errors.targetFrequency}</Text>
            )}
          </View>

          {/* Create Button */}
          <Button onPress={handleCreate} disabled={isLoading} className="mt-4">
            <Text className="text-primary-foreground font-sans-medium">
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
