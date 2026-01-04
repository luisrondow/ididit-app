import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const TOAST_COLORS = {
  success: 'bg-green-500 dark:bg-green-600',
  error: 'bg-red-500 dark:bg-red-600',
  warning: 'bg-amber-500 dark:bg-amber-600',
  info: 'bg-blue-500 dark:bg-blue-600',
};

export function Toast({ id, message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    // Exit animation
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)(id);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const IconComponent = TOAST_ICONS[type];
  const colorClass = TOAST_COLORS[type];

  return (
    <Animated.View
      style={[animatedStyle]}
      className="mx-4 mb-2 rounded-lg shadow-lg"
    >
      <View className={cn('flex-row items-center p-4 rounded-lg', colorClass)}>
        <Icon as={IconComponent} size={20} className="text-white mr-3" />
        <Text className="flex-1 text-white font-medium">{message}</Text>
        <Pressable
          onPress={handleDismiss}
          className="ml-2 p-1 active:opacity-70"
          accessibilityLabel="Dismiss toast"
          accessibilityRole="button"
        >
          <Icon as={X} size={18} className="text-white" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
