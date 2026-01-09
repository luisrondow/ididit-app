import React, { useEffect } from 'react';
import { Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    accentColor: '#22c55e',
    bgLight: 'rgba(34, 197, 94, 0.12)',
    bgDark: 'rgba(34, 197, 94, 0.18)',
    borderLight: 'rgba(34, 197, 94, 0.25)',
    borderDark: 'rgba(34, 197, 94, 0.35)',
  },
  error: {
    icon: XCircle,
    accentColor: '#ef4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    bgDark: 'rgba(239, 68, 68, 0.18)',
    borderLight: 'rgba(239, 68, 68, 0.25)',
    borderDark: 'rgba(239, 68, 68, 0.35)',
  },
  warning: {
    icon: AlertTriangle,
    accentColor: '#f59e0b',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    bgDark: 'rgba(245, 158, 11, 0.18)',
    borderLight: 'rgba(245, 158, 11, 0.25)',
    borderDark: 'rgba(245, 158, 11, 0.35)',
  },
  info: {
    icon: Info,
    accentColor: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    bgDark: 'rgba(59, 130, 246, 0.18)',
    borderLight: 'rgba(59, 130, 246, 0.25)',
    borderDark: 'rgba(59, 130, 246, 0.35)',
  },
};

const SWIPE_THRESHOLD = 50;

export function Toast({ id, message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.97);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const startX = useSharedValue(0);

  const config = TOAST_CONFIG[type];
  const IconComponent = config.icon;

  const dismiss = () => {
    onDismiss(id);
  };

  useEffect(() => {
    // Clean, smooth entrance animation
    const enterTiming = { duration: 280, easing: Easing.out(Easing.cubic) };
    
    translateY.value = withTiming(0, enterTiming);
    scale.value = withTiming(1, enterTiming);
    opacity.value = withTiming(1, { duration: 200 });
    
    // Progress bar animation
    progress.value = withDelay(150, withTiming(1, { duration: duration - 150 }));

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    // Clean exit animation
    const exitTiming = { duration: 220, easing: Easing.in(Easing.cubic) };
    
    translateY.value = withTiming(60, exitTiming);
    scale.value = withTiming(0.95, exitTiming);
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(dismiss)();
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      // Reduce opacity as user swipes
      opacity.value = interpolate(
        Math.abs(translateX.value),
        [0, screenWidth * 0.3],
        [1, 0.5],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      const smoothTiming = { duration: 180, easing: Easing.out(Easing.cubic) };
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD || Math.abs(event.velocityX) > 500) {
        // Swipe to dismiss
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * screenWidth, { duration: 180 });
        opacity.value = withTiming(0, { duration: 150 }, (finished) => {
          if (finished) {
            runOnJS(dismiss)();
          }
        });
      } else {
        // Smooth return to center
        translateX.value = withTiming(0, smoothTiming);
        opacity.value = withTiming(1, smoothTiming);
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(1 - progress.value) * 100}%`,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blurContainer,
            {
              backgroundColor: isDark ? config.bgDark : config.bgLight,
              borderColor: isDark ? config.borderDark : config.borderLight,
            },
          ]}
        >
          {/* Accent line on the left */}
          <View 
            style={[
              styles.accentLine,
              { backgroundColor: config.accentColor }
            ]} 
          />
          
          <View style={styles.content}>
            {/* Icon with subtle glow */}
            <View style={styles.iconContainer}>
              <View 
                style={[
                  styles.iconGlow, 
                  { backgroundColor: config.accentColor }
                ]} 
              />
              <Icon 
                as={IconComponent} 
                size={20} 
                style={{ color: config.accentColor }} 
              />
            </View>
            
            {/* Message */}
            <Text 
              style={[
                styles.message,
                { color: isDark ? '#fafafa' : '#0a0a0a' }
              ]}
              numberOfLines={2}
            >
              {message}
            </Text>
            
            {/* Dismiss button */}
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.dismissButtonPressed,
              ]}
              accessibilityLabel="Dismiss notification"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[
                styles.dismissText,
                { color: isDark ? 'rgba(250, 250, 250, 0.5)' : 'rgba(10, 10, 10, 0.4)' }
              ]}>
                ✕
              </Text>
            </Pressable>
          </View>
          
          {/* Progress bar */}
          <View style={[
            styles.progressContainer,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}>
            <Animated.View 
              style={[
                styles.progressBar,
                { backgroundColor: config.accentColor },
                progressStyle,
              ]} 
            />
          </View>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 18,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.15,
    top: -4,
    left: -4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 8,
  },
  dismissButtonPressed: {
    opacity: 0.5,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    height: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
});
