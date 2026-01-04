// Statistics screen - Overall progress and insights

import { View, ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatisticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Statistics" subtitle="Your progress overview" />
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
            <Text className="text-muted-foreground text-center">
              Statistics and insights will be displayed here.
            </Text>
            <Text className="text-muted-foreground text-center mt-2 text-sm">
              View completion rates, streaks, and trends.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
