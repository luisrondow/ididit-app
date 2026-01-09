// Floating action button for quick log creation

import { Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/utils/haptics';
import { memo, useCallback } from 'react';
import { useRouter } from 'expo-router';

export const FloatingActionButton = memo(function FloatingActionButton() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = useCallback(() => {
    haptics.medium();
    router.push('/log/new');
  }, [router]);

  return (
    <View className="absolute right-5 z-50" style={{ bottom: insets.bottom - 16 }}>
      <Pressable
        onPress={handlePress}
        className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95 active:opacity-90"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}>
        <Text className="font-sans-medium text-primary-foreground">Do it!</Text>
      </Pressable>
    </View>
  );
});
