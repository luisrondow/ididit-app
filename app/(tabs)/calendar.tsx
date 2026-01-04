// Calendar screen - Monthly heatmap view of all habits

import { View, ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Calendar" subtitle={currentMonth} />
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
            <Text className="text-muted-foreground text-center">
              Calendar heatmap will be displayed here.
            </Text>
            <Text className="text-muted-foreground text-center mt-2 text-sm">
              Track all your habits at a glance with a GitHub-style heatmap.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
