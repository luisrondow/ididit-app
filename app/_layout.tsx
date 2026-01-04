import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { initDatabase } from '@/lib/db/init';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on app start
    initDatabase()
      .then(() => {
        console.log('Database initialized successfully');
        setIsDbInitialized(true);
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        setDbError(error instanceof Error ? error.message : 'Failed to initialize database');
      });
  }, []);

  if (dbError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-foreground text-lg font-semibold mb-2">Database Error</Text>
        <Text className="text-muted-foreground text-center">{dbError}</Text>
      </View>
    );
  }

  if (!isDbInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}
