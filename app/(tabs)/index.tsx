// Dashboard screen - Today's habits and quick stats

import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitsStore } from '@/lib/store/habits-store';
import { useEffect, useState } from 'react';
import { HabitCard } from '@/components/habit-card';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { habits, loadActiveHabits, removeHabit, toggleArchive, isLoading } = useHabitsStore();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    await loadActiveHabits();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit? This will also delete all associated log entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeHabit(id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete habit');
            console.error('Error deleting habit:', error);
          }
        },
      },
    ]);
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      await toggleArchive(id, isArchived);
    } catch (error) {
      Alert.alert('Error', 'Failed to archive habit');
      console.error('Error archiving habit:', error);
    }
  };

  const handleCreateHabit = () => {
    router.push('/habit/new');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader
        title="Dashboard"
        subtitle={today}
        rightAction={
          <Button size="icon" variant="ghost" className="rounded-full" onPress={handleCreateHabit}>
            <Icon as={Plus} className="size-5" />
          </Button>
        }
      />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4">
          {isLoading && habits.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground">Loading habits...</Text>
            </View>
          ) : habits.length === 0 ? (
            <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
              <Text className="text-muted-foreground text-center mb-4">
                No habits yet. Tap the + button to create your first habit!
              </Text>
              <Button onPress={handleCreateHabit}>
                <Icon as={Plus} className="size-4 mr-2" />
                <Text>Create Habit</Text>
              </Button>
            </View>
          ) : (
            <View>
              <Text className="text-sm text-muted-foreground mb-3">
                {habits.length} active {habits.length === 1 ? 'habit' : 'habits'}
              </Text>
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onPress={() => {
                    // TODO: Navigate to habit detail view
                    console.log('Navigate to habit detail:', habit.id);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
