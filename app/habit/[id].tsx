// Edit habit screen

import { View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useHabitsStore } from '@/lib/store/habits-store';
import type { Habit } from '@/types/models';
import { validateHabit } from '@/lib/utils/validators';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

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

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getHabit, editHabit } = useHabitsStore();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customValue, setCustomValue] = useState('1');
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [targetFrequency, setTargetFrequency] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHabit();
  }, [id]);

  const loadHabit = async () => {
    if (!id) return;

    const loadedHabit = await getHabit(id);
    if (loadedHabit) {
      setHabit(loadedHabit);
      setName(loadedHabit.name);
      setDescription(loadedHabit.description ?? '');
      setCategory(loadedHabit.category ?? '');
      setTimeRange(loadedHabit.timeRange);
      setTargetFrequency(loadedHabit.targetFrequency.toString());

      if (loadedHabit.customTimeRange) {
        setCustomValue(loadedHabit.customTimeRange.value.toString());
        setCustomUnit(loadedHabit.customTimeRange.unit);
      }
    }
  };

  const handleSave = async () => {
    if (!habit) return;

    const updatedHabit: Habit = {
      ...habit,
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
      updatedAt: new Date().toISOString(),
    };

    const validation = validateHabit(updatedHabit);
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
      await editHabit(updatedHabit);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
      console.error('Error updating habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon as={ArrowLeft} className="size-5" />
        </Button>
        <Text className="text-xl font-semibold text-foreground">Edit Habit</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="gap-4">
          {/* Name */}
          <View className="gap-2">
            <Label>Habit Name *</Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Meditation"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <Text className="text-xs text-destructive">{errors.name}</Text>}
          </View>

          {/* Description */}
          <View className="gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <Text className="text-xs text-destructive">{errors.description}</Text>
            )}
          </View>

          {/* Category */}
          <View className="gap-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Health, Productivity"
              className={errors.category ? 'border-destructive' : ''}
            />
            {errors.category && <Text className="text-xs text-destructive">{errors.category}</Text>}
          </View>

          {/* Time Range */}
          <View className="gap-2">
            <Label>Time Range *</Label>
            <View className="flex-row flex-wrap gap-2">
              {TIME_RANGES.map((range) => (
                <Pressable
                  key={range.value}
                  onPress={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    timeRange === range.value
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}>
                  <Text
                    className={
                      timeRange === range.value ? 'text-primary-foreground' : 'text-foreground'
                    }>
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Custom Time Range */}
          {timeRange === 'custom' && (
            <View className="gap-2">
              <Label>Custom Period *</Label>
              <View className="flex-row gap-2">
                <Input
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="1"
                  keyboardType="number-pad"
                  className="flex-1"
                />
                <View className="flex-row gap-2">
                  {CUSTOM_UNITS.map((unit) => (
                    <Pressable
                      key={unit.value}
                      onPress={() => setCustomUnit(unit.value)}
                      className={`px-3 py-2 rounded-lg border ${
                        customUnit === unit.value
                          ? 'bg-primary border-primary'
                          : 'bg-card border-border'
                      }`}>
                      <Text
                        className={
                          customUnit === unit.value
                            ? 'text-primary-foreground'
                            : 'text-foreground'
                        }>
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
            <Label>Target Frequency *</Label>
            <Input
              value={targetFrequency}
              onChangeText={setTargetFrequency}
              placeholder="1"
              keyboardType="number-pad"
              className={errors.targetFrequency ? 'border-destructive' : ''}
            />
            <Text className="text-xs text-muted-foreground">
              How many times per {timeRange === 'custom' ? 'custom period' : timeRange.slice(0, -2)}
            </Text>
            {errors.targetFrequency && (
              <Text className="text-xs text-destructive">{errors.targetFrequency}</Text>
            )}
          </View>

          {/* Save Button */}
          <Button onPress={handleSave} disabled={isLoading} className="mt-4">
            <Text>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
