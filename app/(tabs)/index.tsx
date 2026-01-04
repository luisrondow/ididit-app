// Dashboard screen - Today's habits and quick stats

import { View, ScrollView } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader
        title="Dashboard"
        subtitle={today}
        rightAction={
          <Button size="icon" variant="ghost" className="rounded-full">
            <Icon as={Plus} className="size-5" />
          </Button>
        }
      />
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="bg-card border border-border rounded-lg p-6 items-center justify-center min-h-[200px]">
            <Text className="text-muted-foreground text-center">
              No habits yet. Tap the + button to create your first habit!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
