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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '@/lib/context/toast-context';
import { ErrorBoundary as AppErrorBoundary } from '@/components/error-boundary';
import { useFonts } from 'expo-font';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

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

  if (!isDbInitialized || !fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <ToastProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="statistics" options={{ headerShown: false }} />
              <Stack.Screen name="log/new" options={{ headerShown: false }} />
            </Stack>
            <PortalHost />
          </ToastProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
